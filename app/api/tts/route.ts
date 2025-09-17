import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { put } from '@vercel/blob';
import { db } from '@/lib/db/drizzle';
import { vocabulary, lessons, topics } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

// OpenAI TTS API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

// Voice mapping for different languages
const VOICE_MAPPING = {
  english: 'fable',
  french: 'fable',
  german: 'fable',
  spanish: 'fable'
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
      const [vocab] = await db
        .select({ audio_url: vocabulary.audio_url })
        .from(vocabulary)
        .where(eq(vocabulary.id, vocabularyId))
        .limit(1);
      existingAudio = vocab?.audio_url;
      console.log(`TTS: Vocabulary cache check - found: ${existingAudio ? 'yes' : 'no'}`);
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

    // Determine voice based on language or use provided voice
    const selectedVoice = voice || VOICE_MAPPING[language as keyof typeof VOICE_MAPPING] || VOICE_MAPPING.english;

    // Call OpenAI TTS API
    const response = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: selectedVoice,
        response_format: 'mp3',
        speed: 1.0
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI TTS API error:', errorData);
      console.error('Request details:', {
        model: 'tts-1',
        voice: selectedVoice,
        text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
      });
      return NextResponse.json({ 
        error: 'Failed to generate speech',
        details: errorData 
      }, { status: response.status });
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Upload to Vercel Blob
    const filename = `tts-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    const blob = await put(filename, audioBuffer, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Store in database
    if (vocabularyId) {
      await db
        .update(vocabulary)
        .set({
          audio_blob_id: blob.url.split('/').pop()?.split('?')[0] || filename,
          audio_url: blob.url,
          audio_generated_at: new Date(),
        })
        .where(eq(vocabulary.id, vocabularyId));
      console.log(`TTS: Stored vocabulary audio for ID: ${vocabularyId}`);
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
          cultural_audio_blob_id: blob.url.split('/').pop()?.split('?')[0] || filename,
          cultural_audio_url: blob.url,
          cultural_audio_generated_at: new Date(),
        })
        .where(eq(lessons.id, lessonId));
      console.log(`TTS: Stored cultural audio for lesson: ${lessonId}`);
    } else if (lessonId && type === 'content') {
      await db
        .update(lessons)
        .set({
          content_audio_blob_id: blob.url.split('/').pop()?.split('?')[0] || filename,
          content_audio_url: blob.url,
          content_audio_generated_at: new Date(),
        })
        .where(eq(lessons.id, lessonId));
      console.log(`TTS: Stored content audio for lesson: ${lessonId}`);
    }

    // Audio is stored in database for all cases

    console.log(`TTS: Generated new audio for ${type}: ${blob.url}`);
    return NextResponse.json({
      success: true,
      audio_url: blob.url,
      cached: false,
      format: 'mp3',
      voice: selectedVoice,
      text: text
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 