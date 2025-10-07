import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { language, level, topic, turns, lessonVocabulary } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Compose a compact transcript
    const transcript = (Array.isArray(turns) ? turns : [])
      .map((t: any, idx: number) => {
        const rt = typeof t?.responseTimeMs === 'number' ? `${t.responseTimeMs}ms` : 'n/a';
        return `${idx + 1}. user: ${t.user || ''}\n   ai: ${t.ai || ''}\n   response_time: ${rt}`;
      })
      .join('\n');

    const vocabList = (Array.isArray(lessonVocabulary) ? lessonVocabulary : [])
      .slice(0, 100)
      .map((w: any) => w?.term || w)
      .filter(Boolean)
      .join(', ');

    const prompt = `You are an expert language teacher.
Rate the learner's conversation performance for ${language} at ${level} level on the topic "${topic}".

Inputs:
- Transcript with response times (ms):\n${transcript}
- Lesson vocabulary (for reference): ${vocabList}

Scoring rubric (0-100 each):
1) Answer quality (accuracy, relevance, completeness)
2) Vocabulary use (variety, appropriate use; reward use beyond trivial words)
3) Fluency (coherence, naturalness)
4) Response time (faster is better; allow thinking time for complex questions)

Output JSON strictly in this schema:
{
  "scores": { "quality": number, "vocabulary": number, "fluency": number, "response_time": number, "overall": number },
  "feedback": {
    "summary": string,
    "strengths": string[],
    "improvements": string[],
    "suggested_practice_questions": string[]
  }
}`;

    const model = process.env.OPENAI_GPT5_FALLBACK || 'gpt-4o';
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'Always return valid JSON for the requested schema, no prose.' },
        { role: 'user', content: prompt }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let parsed: any;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = { error: 'Failed to parse rating' };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Conversation rating error:', error);
    return NextResponse.json({ error: 'Failed to rate conversation' }, { status: 500 });
  }
}


