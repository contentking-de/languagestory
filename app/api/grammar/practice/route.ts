import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { topics, lessons, courses } from '@/lib/db/content-schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const lessonId = searchParams.get('lessonId');
    const count = Math.min(parseInt(searchParams.get('count') || '5'), 20);

    if (!language || !['french', 'german', 'spanish'].includes(language)) {
      return NextResponse.json(
        { error: 'Valid language parameter is required (french, german, spanish)' },
        { status: 400 }
      );
    }

    const conditions = [
      eq(topics.topic_type, 'grammar_exercise'),
      eq(courses.language, language),
    ];

    if (lessonId && lessonId !== 'all') {
      conditions.push(eq(topics.lesson_id, parseInt(lessonId)));
    }

    // Fetch more topics than needed to get enough exercises after extraction
    const grammarTopics = await db
      .select({
        id: topics.id,
        title: topics.title,
        interactive_data: topics.interactive_data,
        lesson_title: lessons.title,
      })
      .from(topics)
      .innerJoin(lessons, eq(topics.lesson_id, lessons.id))
      .innerJoin(courses, eq(lessons.course_id, courses.id))
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(20);

    // Extract and normalize exercises from topics
    const allExercises: Array<{
      topicId: number;
      topicTitle: string;
      lessonTitle: string | null;
      type: string;
      instruction: string;
      question: string;
      correct_answer: string;
      explanation: string;
      options?: string[];
    }> = [];

    for (const topic of grammarTopics) {
      const data = topic.interactive_data as any;
      if (!data) continue;

      const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
      const rawExercises = Array.isArray(data.exercises) ? data.exercises : [];
      const base = rawQuestions.length > 0 ? rawQuestions : rawExercises;

      for (const q of base) {
        const options: string[] | undefined = Array.isArray(q?.options) ? q.options : undefined;
        let correctAnswer: string = (q?.correct_answer || q?.answer || '').toString();

        if (options && options.length > 0 && correctAnswer) {
          const key = correctAnswer.trim().toUpperCase();
          const letterIndex = key.length === 1 && key >= 'A' && key <= 'Z'
            ? key.charCodeAt(0) - 'A'.charCodeAt(0) : -1;
          if (letterIndex >= 0 && letterIndex < options.length) {
            correctAnswer = options[letterIndex];
          } else {
            const asNum = parseInt(key, 10);
            if (!isNaN(asNum)) {
              const idx = asNum >= 1 && asNum <= options.length ? asNum - 1
                : (asNum >= 0 && asNum < options.length ? asNum : -1);
              if (idx >= 0) correctAnswer = options[idx];
            } else {
              const found = options.find(o => o.trim().toLowerCase() === correctAnswer.trim().toLowerCase());
              if (found) correctAnswer = found;
              else {
                const prefFound = options.find(o => o.trim().toUpperCase().startsWith(key));
                if (prefFound) correctAnswer = prefFound;
              }
            }
          }
        }

        if (!q?.question && !q?.prompt) continue;
        if (!correctAnswer.trim()) continue;

        allExercises.push({
          topicId: topic.id,
          topicTitle: topic.title,
          lessonTitle: topic.lesson_title,
          type: q?.type || (options ? 'multiple_choice' : 'exercise'),
          instruction: q?.instruction || (options ? 'Choose the correct answer' : 'Answer the question'),
          question: q?.question || q?.prompt || '',
          correct_answer: correctAnswer,
          explanation: q?.explanation || '',
          options,
        });
      }
    }

    // Shuffle and take requested count
    const shuffled = allExercises.sort(() => Math.random() - 0.5).slice(0, count);

    return NextResponse.json({
      exercises: shuffled,
      total: shuffled.length,
    });
  } catch (error) {
    console.error('Error fetching practice grammar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grammar for practice' },
      { status: 500 }
    );
  }
}
