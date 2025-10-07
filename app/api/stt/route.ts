import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Forward to OpenAI Whisper
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const fd = new FormData();
        fd.append('file', audioFile, 'audio.webm');
        fd.append('model', 'whisper-1');
        return fd;
      })(),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Whisper error:', err);
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text || '' });
  } catch (error) {
    console.error('STT error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}


