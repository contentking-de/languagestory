import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quizzes, topics } from '@/lib/db/schema';
import { eq, inArray, or } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonId = parseInt(id);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    // Also include quizzes attached to topics within this lesson
    const lessonTopicIds = await db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.lesson_id, lessonId));

    const topicIds = lessonTopicIds.map(t => t.id);

    const quizzesData = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        quiz_type: quizzes.quiz_type,
        points_value: quizzes.points_value,
        is_published: quizzes.is_published,
      })
      .from(quizzes)
      .where(
        topicIds.length > 0
          ? or(eq(quizzes.lesson_id, lessonId), inArray(quizzes.topic_id, topicIds))
          : eq(quizzes.lesson_id, lessonId)
      )
      .orderBy(quizzes.created_at);

    return NextResponse.json(quizzesData);
  } catch (error) {
    console.error('Error fetching lesson quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson quizzes' },
      { status: 500 }
    );
  }
} 