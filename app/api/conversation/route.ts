import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses, vocabulary as vocabTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { lessonId, messages, start } = await request.json();
    const { stop } = (await request.json().catch(() => ({}))) as any;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }

    // Fetch lesson context
    const [lesson] = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        content: lessons.content,
        course_language: courses.language,
        course_title: courses.title,
        course_level: courses.level,
      })
      .from(lessons)
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const language = (lesson as any).course_language || 'english';
    const level = (lesson as any).course_level || 'beginner';
    const topic = (lesson as any).title || 'general conversation';
    const lessonContent: string = (lesson as any).content || '';

    // Fetch lesson vocabulary (up to 200 items)
    const vocabRows = await db
      .select({
        word_english: (vocabTable as any).word_english,
        word_french: (vocabTable as any).word_french,
        word_german: (vocabTable as any).word_german,
        word_spanish: (vocabTable as any).word_spanish,
        word_type: (vocabTable as any).word_type,
      })
      .from(vocabTable)
      .where(eq((vocabTable as any).lesson_id, lessonId))
      .limit(200);

    const langKey = (language || '').toLowerCase() === 'german'
      ? 'word_german'
      : (language || '').toLowerCase() === 'french'
      ? 'word_french'
      : (language || '').toLowerCase() === 'spanish'
      ? 'word_spanish'
      : 'word_english';
    const vocabLines = (vocabRows || [])
      .map((v: any) => {
        const target = (v?.[langKey] || '').toString().trim();
        const en = (v?.word_english || '').toString().trim();
        const wt = (v?.word_type || '').toString().trim();
        if (!target && !en) return '';
        return `- ${target || en}${en && target ? ` (${en})` : ''}${wt ? ` [${wt}]` : ''}`;
      })
      .filter(Boolean)
      .slice(0, 200)
      .join('\n');

    const systemPrompt = `You are a friendly ${language} conversation partner for a ${level} learner.
Keep exchanges short (1-2 sentences), encouraging, and on topic: "${topic}".
Use only ${language} in replies unless explicitly asked for help in English.
Offer gentle corrections and follow-up questions.
IMPORTANT: Never repeat or rephrase the same question you already asked. Each new turn must either acknowledge the learner's last answer or ask a new, distinct question that progresses the topic.
Ask exactly ONE question at a time.
Base the conversation on the following lesson content (use it to craft questions and references):\n---\n${lessonContent.slice(0, 4000)}\n---\n
When crafting questions, prefer to use this lesson vocabulary and vary across different items to avoid near-duplicate questions:\n${vocabLines ? vocabLines + '\n' : ''}`;

    const hasMessages = Array.isArray(messages) && messages.length > 0;
    const seedUserMessage = start
      ? {
          role: 'user' as const,
          content: `Start the conversation now with a brief friendly welcome in ${language} and ask if the learner is ready for a conversation about the lesson topic. Do NOT ask content questions yet. Wait for the learner's confirmation (e.g., yes/ready).`
        }
      : stop
      ? {
          role: 'user' as const,
          content: `The learner has stopped the conversation. In ${language}, reply with a short closing message that thanks the learner for the nice conversation and points them to their personal conversation rating below. Do NOT ask any new question. Say something like: "Thank you for our nice conversation. Please find my personal conversation rating underneath. Read it carefully and you will find excellent hints to improve for the next time!"`
        }
      : {
          role: 'user' as const,
          content: `Continue the conversation based strictly on the lesson content and the chat so far.
Ask exactly one question at a time, then wait for the learner's answer.`
        };

    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...(hasMessages ? messages : [seedUserMessage]),
    ];

    // Add anti-repetition hint using the last assistant question if available
    if (hasMessages && !stop) {
      const lastAssistant = [...messages].reverse().find((m: any) => m?.role === 'assistant')?.content as string | undefined;
      if (lastAssistant && lastAssistant.trim().length > 0) {
        const snippet = lastAssistant.length > 220 ? lastAssistant.slice(0, 220) + '…' : lastAssistant;
        chatMessages.push({
          role: 'user',
          content: `Avoid repeating or rephrasing your previous question: "${snippet}". Instead, either briefly acknowledge the learner's last answer or ask a different, follow-up question that advances the conversation.`
        });
      }
    }

    const model = process.env.OPENAI_GPT5_FALLBACK || 'gpt-4o';
    const completion = await openai.chat.completions.create({
      model,
      messages: chatMessages,
      temperature: stop ? 0.3 : 0.7,
      max_tokens: stop ? 120 : 500,
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    return NextResponse.json({ reply, language, lesson: { id: lessonId, topic, level } });
  } catch (error: any) {
    console.error('Conversation API error:', error?.response?.data || error?.message || error);
    return NextResponse.json({ error: 'Failed to generate conversation reply' }, { status: 500 });
  }
}


