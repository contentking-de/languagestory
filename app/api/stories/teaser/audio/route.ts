import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses } from '@/lib/db/schema';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { put } from '@vercel/blob';

const VOICE_MAPPING: Record<string, string> = {
  english: 'fable',
  french: 'fable',
  german: 'fable',
  spanish: 'alloy',
};

function detectLanguage(text: string): string {
  if (/[àâäéèêëïîôöùûüÿç]/i.test(text)) return 'french';
  if (/[äöüß]/i.test(text)) return 'german';
  if (/[ñáéíóúü]/i.test(text)) return 'spanish';
  return 'english';
}

export async function GET(request: NextRequest) {
  try {
    const lessonId = parseInt(request.nextUrl.searchParams.get('lessonId') || '');
    if (isNaN(lessonId)) {
      return NextResponse.json({ error: 'Invalid lessonId' }, { status: 400 });
    }

    // Validate: must be a published story lesson with content
    const [lesson] = await db
      .select({
        id: lessons.id,
        content: lessons.content,
        content_audio_url: lessons.content_audio_url,
        courseLanguage: courses.language,
      })
      .from(lessons)
      .innerJoin(courses, eq(lessons.course_id, courses.id))
      .where(
        and(
          eq(lessons.id, lessonId),
          eq(lessons.lesson_type, 'story'),
          eq(lessons.is_published, true),
          isNotNull(lessons.content),
          sql`LENGTH(${lessons.content}) > 50`
        )
      )
      .limit(1);

    if (!lesson) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Return cached audio if available
    if (lesson.content_audio_url) {
      return NextResponse.json({ audio_url: lesson.content_audio_url, cached: true });
    }

    // Generate TTS
    const text = (lesson.content || '').replace(/[\[\]{}()]/g, '').trim();
    const lang = (lesson.courseLanguage || detectLanguage(text)).toLowerCase();

    // Try ElevenLabs first, fall back to OpenAI
    const xiKey = process.env.ELEVENLABS_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let audioBuffer: ArrayBuffer;

    if (xiKey) {
      const baseUrl = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io';
      const modelId = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
      const voiceId =
        (lang === 'german' && process.env.ELEVENLABS_VOICE_GERMAN) ||
        (lang === 'french' && process.env.ELEVENLABS_VOICE_FRENCH) ||
        (lang === 'spanish' && process.env.ELEVENLABS_VOICE_SPANISH) ||
        (lang === 'english' && process.env.ELEVENLABS_VOICE_ENGLISH) ||
        process.env.ELEVENLABS_VOICE_DEFAULT;

      if (!voiceId) {
        return NextResponse.json({ error: 'TTS voice not configured' }, { status: 500 });
      }

      const stability = parseFloat(process.env.ELEVENLABS_STABILITY || '0.45');
      const similarityBoost = parseFloat(process.env.ELEVENLABS_SIMILARITY || '0.8');

      const resp = await fetch(`${baseUrl}/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': xiKey,
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: { stability, similarity_boost: similarityBoost },
        }),
      });

      if (!resp.ok) {
        console.error('ElevenLabs TTS error for teaser:', await resp.text());
        return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
      }
      audioBuffer = await resp.arrayBuffer();
    } else if (openaiKey) {
      const voice = VOICE_MAPPING[lang] || 'fable';
      const speed = lang === 'spanish' ? 0.85 : 1.0;

      const resp = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice,
          response_format: 'mp3',
          speed,
        }),
      });

      if (!resp.ok) {
        console.error('OpenAI TTS error for teaser:', await resp.text());
        return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
      }
      audioBuffer = await resp.arrayBuffer();
    } else {
      return NextResponse.json({ error: 'No TTS provider configured' }, { status: 500 });
    }

    // Upload to Vercel Blob and cache in DB
    const blobName = `tts-story-teaser-${lessonId}-${Date.now()}.mp3`;
    const blob = await put(blobName, audioBuffer, { access: 'public', addRandomSuffix: false });

    await db
      .update(lessons)
      .set({
        content_audio_blob_id: blob.url.split('/').pop()?.split('?')[0] || blobName,
        content_audio_url: blob.url,
        content_audio_generated_at: new Date(),
      })
      .where(eq(lessons.id, lessonId));

    return NextResponse.json({ audio_url: blob.url, cached: false });
  } catch (error) {
    console.error('Story teaser audio error:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
