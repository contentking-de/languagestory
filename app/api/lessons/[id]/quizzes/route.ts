import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quizzes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    const quizzesData = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        quiz_type: quizzes.quiz_type,
        points_value: quizzes.points_value,
        is_published: quizzes.is_published,
      })
      .from(quizzes)
      .where(eq(quizzes.lesson_id, lessonId))
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