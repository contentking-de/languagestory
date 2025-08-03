import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quizzes, lessons, courses, quiz_questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    const [quizData] = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        quiz_type: quizzes.quiz_type,
        pass_percentage: quizzes.pass_percentage,
        time_limit: quizzes.time_limit,
        max_attempts: quizzes.max_attempts,
        points_value: quizzes.points_value,
        is_published: quizzes.is_published,
        created_at: quizzes.created_at,
        lesson_id: quizzes.lesson_id,
        topic_id: quizzes.topic_id,
        lesson_title: lessons.title,
        course_title: courses.title,
        course_language: courses.language,
        course_level: courses.level,
      })
      .from(quizzes)
      .leftJoin(lessons, eq(quizzes.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!quizData) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      title,
      description,
      quiz_type,
      lesson_id,
      pass_percentage,
      time_limit,
      max_attempts,
      points_value,
      is_published
    } = body;

    // Get existing quiz to preserve configuration
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Parse existing configuration
    let existingConfig: any = {};
    try {
      const parsed = JSON.parse(existingQuiz.description || '{}');
      if (parsed.config) {
        existingConfig = parsed.config;
      }
    } catch (error) {
      // Keep empty config if parsing fails
    }

    // Create updated description with preserved config
    const updatedDescription = {
      description: description || '',
      config: existingConfig
    };

    const [updatedQuiz] = await db
      .update(quizzes)
      .set({
        title,
        description: JSON.stringify(updatedDescription),
        quiz_type,
        lesson_id,
        pass_percentage,
        time_limit,
        max_attempts,
        points_value,
        is_published,
      })
      .where(eq(quizzes.id, quizId))
      .returning();

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quizId = parseInt(id);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Delete all questions associated with this quiz first
    await db
      .delete(quiz_questions)
      .where(eq(quiz_questions.quiz_id, quizId));

    // Delete the quiz
    await db
      .delete(quizzes)
      .where(eq(quizzes.id, quizId));

    return NextResponse.json(
      { message: 'Quiz deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
} 