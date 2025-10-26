import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { put } from '@vercel/blob';
import { db } from '@/lib/db/drizzle';
import { vocabulary, lessons, topics, media_files } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

// OpenAI TTS API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

// Voice mapping for different languages (tuned for clarity)
const VOICE_MAPPING: Record<string, string> = {
  english: 'fable',
  french: 'fable',
  german: 'fable',
  // Spanish benefits from a clearer, less-stylized voice
  spanish: 'alloy'
};

// Language detection helper
function detectLanguage(text: string): string {
  // Simple language detection based on common patterns
  const frenchPattern = /[àâäéèêëïîôöùûüÿç]/i;
  const germanPattern = /[äöüß]/i;
  const spanishPattern = /[ñáéíóúü]/i;
  
  if (frenchPattern.test(text)) return 'french';
  if (germanPattern.test(text)) return 'german';
  if (spanishPattern.test(text)) return 'spanish';
  return 'english';
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, language, voice, vocabularyId, lessonId, type, topicId } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Check if audio already exists in database
    let existingAudio = null;
    console.log(`TTS: Checking cache for lessonId: ${lessonId}, type: ${type}, vocabularyId: ${vocabularyId}`);
    
    if (vocabularyId) {
      // Use per-language deterministic cache via media_files.name
      const normalizedLang = (language || detectLanguage(text) || 'english').toString().toLowerCase();
      const slugPart = (text as string)
        .normalize('NFKD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'x';
      const cacheName = `tts-vocab-${vocabularyId}-${normalizedLang}-${slugPart}.mp3`;
      const [mf] = await db
        .select({ url: media_files.url })
        .from(media_files)
        .where(eq(media_files.name, cacheName))
        .limit(1);
      existingAudio = (mf as any)?.url || null;
      console.log(`TTS: Vocabulary per-language cache check - name: ${cacheName} - found: ${existingAudio ? 'yes' : 'no'}`);
    } else if (topicId && type === 'story') {
      const [topic] = await db
        .select({ audio_url: topics.audio_file })
        .from(topics)
        .where(eq(topics.id, topicId))
        .limit(1);
      existingAudio = (topic as any)?.audio_url || null;
      console.log(`TTS: Story topic cache check - found: ${existingAudio ? 'yes' : 'no'}`);
    } else if (lessonId && type === 'cultural') {
      const [lesson] = await db
        .select({ cultural_audio_url: lessons.cultural_audio_url })
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);
      existingAudio = lesson?.cultural_audio_url;
      console.log(`TTS: Cultural cache check - found: ${existingAudio ? 'yes' : 'no'}`);
    } else if (lessonId && type === 'content') {
      const [lesson] = await db
        .select({ content_audio_url: lessons.content_audio_url })
        .from(lessons)
        .where(eq(lessons.id, lessonId))
        .limit(1);
      existingAudio = lesson?.content_audio_url;
      console.log(`TTS: Content cache check - found: ${existingAudio ? 'yes' : 'no'}`);
    }

    // Simple caching logic: if audio exists in database, use it
    // This works for both main page and workflow
    console.log(`TTS: Final cache decision - existingAudio: ${existingAudio ? 'found' : 'not found'}`);

    // If audio exists, return it
    if (existingAudio) {
      console.log(`TTS: Returning cached audio for ${type}: ${existingAudio}`);
      return NextResponse.json({
        success: true,
        audio_url: existingAudio,
        cached: true,
        format: 'mp3',
        text: text
      });
    }

    // Normalize/auto-detect language
    const normalizedLang = (language || detectLanguage(text) || 'english').toString().toLowerCase();
    // Determine provider (start using ElevenLabs for lesson content)
    const providerEnv = (process.env.TTS_PROVIDER || '').toLowerCase();
    let provider: 'openai' | 'elevenlabs' = providerEnv === 'elevenlabs' ? 'elevenlabs' : 'openai';
    if (type === 'content' || type === 'cultural' || type === 'vocabulary' || type === 'conversation') provider = 'elevenlabs';

    // Determine voice based on language or use provided voice
    const selectedVoice = voice || VOICE_MAPPING[normalizedLang] || VOICE_MAPPING.english;
    // Model/speed tuning per language for OpenAI
    let ttsModel = 'tts-1';
    const ttsSpeed = normalizedLang === 'spanish' ? 0.85 : 1.0;
    // Clean text: remove stray braces/brackets and trim
    const cleanText = (text as string).replace(/[\[\]{}()]/g, '').trim();

    // Build audio via selected provider
    let audioBuffer: ArrayBuffer;
    if (provider === 'elevenlabs') {
      const baseUrl = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io';
      const modelId = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
      const xiKey = process.env.ELEVENLABS_API_KEY;
      if (!xiKey) {
        return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
      }
      const voiceId = (
        (normalizedLang === 'german' && process.env.ELEVENLABS_VOICE_GERMAN) ||
        (normalizedLang === 'french' && process.env.ELEVENLABS_VOICE_FRENCH) ||
        (normalizedLang === 'spanish' && process.env.ELEVENLABS_VOICE_SPANISH) ||
        (normalizedLang === 'english' && process.env.ELEVENLABS_VOICE_ENGLISH) ||
        process.env.ELEVENLABS_VOICE_DEFAULT
      );
      if (!voiceId) {
        return NextResponse.json({ error: 'ElevenLabs voice not configured' }, { status: 500 });
      }
      const stability = parseFloat(process.env.ELEVENLABS_STABILITY || '0.45');
      const similarityBoost = parseFloat(process.env.ELEVENLABS_SIMILARITY || '0.8');
      const style = parseFloat(process.env.ELEVENLABS_STYLE || '0');
      const useSpeakerBoost = (process.env.ELEVENLABS_USE_SPEAKER_BOOST || 'true') === 'true';
      const optimizeStreamingLatency = parseInt(process.env.ELEVENLABS_OPTIMIZE_STREAMING_LATENCY || '0');

      const elResponse = await fetch(`${baseUrl}/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': xiKey,
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: modelId,
          optimize_streaming_latency: optimizeStreamingLatency,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      });
      if (!elResponse.ok) {
        const errText = await elResponse.text();
        console.error('ElevenLabs TTS error:', errText);
        return NextResponse.json({ error: 'Failed to generate speech (ElevenLabs)', details: errText }, { status: elResponse.status });
      }
      audioBuffer = await elResponse.arrayBuffer();
    } else {
      // OpenAI path
      const doRequest = async (model: string) => fetch(OPENAI_TTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: cleanText,
          voice: selectedVoice,
          response_format: 'mp3',
          speed: ttsSpeed
        }),
      });

      // First attempt
      let response = await doRequest(ttsModel);

      if (!response.ok) {
        // If model not found (e.g., tts-1-hq), fallback to tts-1
        try {
          const errorData = await response.json();
          if ((errorData?.error?.code === 'model_not_found' || errorData?.error?.message?.includes('does not exist')) && ttsModel !== 'tts-1') {
            ttsModel = 'tts-1';
            response = await doRequest(ttsModel);
          }
          if (!response.ok) {
            console.error('OpenAI TTS API error:', errorData);
            console.error('Request details:', {
              model: ttsModel,
              voice: selectedVoice,
              text: cleanText.substring(0, 100) + (cleanText.length > 100 ? '...' : '')
            });
            return NextResponse.json({ 
              error: 'Failed to generate speech',
              details: errorData 
            }, { status: response.status });
          }
        } catch {
          return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
        }
      }
      audioBuffer = await response.arrayBuffer();
    }

    // For conversation, return base64 directly to reduce latency (no upload/store)
    if (type === 'conversation') {
      // Convert ArrayBuffer to base64
      let base64: string;
      try {
        // Node.js environment
        // @ts-ignore
        base64 = Buffer.from(audioBuffer).toString('base64');
      } catch {
        // Fallback for environments without Buffer
        const bytes = new Uint8Array(audioBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        // @ts-ignore
        base64 = btoa(binary);
      }

      return NextResponse.json({
        success: true,
        audio_base64: base64,
        cached: false,
        format: 'mp3',
        voice: selectedVoice,
        text: cleanText
      });
    }

    // Otherwise upload to Vercel Blob and store for caching
    // If vocabularyId: use deterministic name per language/text for stable caching
    const normalizedLangForStore = (language || detectLanguage(text) || 'english').toString().toLowerCase();
    const slugPartForStore = (cleanText as string)
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'x';
    const deterministicName = vocabularyId ? `tts-vocab-${vocabularyId}-${normalizedLangForStore}-${slugPartForStore}.mp3` : `tts-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    const blob = await put(deterministicName, audioBuffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    if (vocabularyId) {
      // Save to media_files as deterministic cache entry
      try {
        await db.insert(media_files).values({
          blob_id: blob.url.split('/').pop()?.split('?')[0] || deterministicName,
          name: deterministicName,
          url: blob.url,
          size: (audioBuffer as ArrayBuffer).byteLength ?? 0,
          type: 'audio/mpeg',
          category: 'tts',
          tags: [{ vocabularyId, language: normalizedLangForStore } as any],
          uploaded_by: user.id,
        } as any);
      } catch (e) {
        // ignore duplicate inserts
      }
      console.log(`TTS: Stored vocabulary audio cache for vocab ${vocabularyId} (${normalizedLangForStore})`);
    } else if (topicId && type === 'story') {
      await db
        .update(topics)
        .set({
          audio_file: blob.url,
        })
        .where(eq(topics.id, topicId));
      console.log(`TTS: Stored story audio for topic: ${topicId}`);
    } else if (lessonId && type === 'cultural') {
      await db
        .update(lessons)
        .set({
          cultural_audio_blob_id: blob.url.split('/').pop()?.split('?')[0] || deterministicName,
          cultural_audio_url: blob.url,
          cultural_audio_generated_at: new Date(),
        })
        .where(eq(lessons.id, lessonId));
      console.log(`TTS: Stored cultural audio for lesson: ${lessonId}`);
    } else if (lessonId && type === 'content') {
      await db
        .update(lessons)
        .set({
          content_audio_blob_id: blob.url.split('/').pop()?.split('?')[0] || deterministicName,
          content_audio_url: blob.url,
          content_audio_generated_at: new Date(),
        })
        .where(eq(lessons.id, lessonId));
      console.log(`TTS: Stored content audio for lesson: ${lessonId}`);
    }

    console.log(`TTS: Generated new audio for ${type}: ${blob.url}`);
    return NextResponse.json({
      success: true,
      audio_url: blob.url,
      cached: false,
      format: 'mp3',
      voice: selectedVoice,
      text: cleanText
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 