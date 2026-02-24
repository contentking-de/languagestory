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
        cultural_information: lessons.cultural_information,
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
    const culturalInfo: string = (lesson as any).cultural_information || '';

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

    const culturalBlock = culturalInfo
      ? `\nCultural background for this lesson (use as inspiration, not a script):\n---\n${culturalInfo.slice(0, 2000)}\n---\n`
      : '';

    const systemPrompt = `You are a friendly, curious ${language} conversation partner for a ${level} learner.
The lesson topic is: "${topic}".
Use only ${language} in replies unless explicitly asked for help in English.
Keep replies short (1-3 sentences) and always end with exactly ONE question.

CONVERSATION STYLE:
- Be warm and encouraging. Briefly acknowledge or react to what the learner said before moving on.
- Offer gentle corrections inline when you notice mistakes (e.g. "Ah, du meinst … — genau!").
- Vary your question types across turns: opinion questions, personal experience, comparisons, hypothetical scenarios, "what would you do if…", true/false challenges, fill-in-the-blank prompts, and factual recall.

TOPIC SCOPE:
- Use the lesson content and cultural information below as your *starting point and anchor*.
- You may naturally expand into related real-world topics, personal questions, or broader cultural themes that connect to the lesson — the conversation should feel organic, not like a quiz.
- About 60-70% of questions should relate to lesson content/vocabulary/culture; the remaining 30-40% can explore the learner's own life, opinions, or related tangents.

ABSOLUTE RULES ON REPETITION:
- NEVER ask the same question twice, even rephrased or with minor word changes.
- NEVER ask about the same vocabulary word or concept you already covered in a previous turn.
- Before generating a question, mentally review ALL your previous questions in this conversation and ensure the new one is substantially different in both topic and structure.
- If you run low on lesson material, branch into related real-world topics rather than recycling earlier questions.

Lesson content (use as reference, not a script):\n---\n${lessonContent.slice(0, 4000)}\n---\n${culturalBlock}
Lesson vocabulary (spread usage across many turns; never reuse the same item):\n${vocabLines ? vocabLines + '\n' : ''}`;

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
          content: `Continue the conversation naturally. React to my last answer, then ask a new question that explores a different angle of the topic or branches into something related.`
        };

    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...(hasMessages ? messages : [seedUserMessage]),
    ];

    // Build a summary of ALL previous assistant questions so the model can avoid repetition
    if (hasMessages && !stop) {
      const previousAssistantTurns = (messages as Array<{ role: string; content: string }>)
        .filter(m => m.role === 'assistant')
        .map((m, i) => {
          const text = (m.content || '').trim();
          return text.length > 150 ? `${i + 1}. ${text.slice(0, 150)}…` : `${i + 1}. ${text}`;
        });

      if (previousAssistantTurns.length > 0) {
        chatMessages.push({
          role: 'user',
          content: `REMINDER — Here are ALL your previous messages in this conversation. Your next question MUST be substantially different from every single one of these:\n${previousAssistantTurns.join('\n')}\n\nNow respond to my latest message with a brief reaction and a fresh, different question.`
        });
      }
    }

    const model = process.env.OPENAI_GPT5_FALLBACK || 'gpt-4o';
    const completion = await openai.chat.completions.create({
      model,
      messages: chatMessages,
      temperature: stop ? 0.3 : 0.85,
      max_tokens: stop ? 120 : 500,
      frequency_penalty: 0.6,
      presence_penalty: 0.5,
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    return NextResponse.json({ reply, language, lesson: { id: lessonId, topic, level } });
  } catch (error: any) {
    console.error('Conversation API error:', error?.response?.data || error?.message || error);
    return NextResponse.json({ error: 'Failed to generate conversation reply' }, { status: 500 });
  }
}


