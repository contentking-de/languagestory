import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';

// OpenAI TTS API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';

// Voice mapping for different languages
const VOICE_MAPPING = {
  english: 'alloy',
  french: 'echo',
  german: 'fable',
  spanish: 'onyx'
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
    const { text, language, voice } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
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
      return NextResponse.json({ 
        error: 'Failed to generate speech',
        details: errorData 
      }, { status: response.status });
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audio: audioBase64,
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