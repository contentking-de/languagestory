import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quiz_questions } from '@/lib/db/schema';
import { eq, max } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = parseInt(params.id);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    const questionsData = await db
      .select({
        id: quiz_questions.id,
        question_text: quiz_questions.question_text,
        question_type: quiz_questions.question_type,
        points: quiz_questions.points,
        correct_answer: quiz_questions.correct_answer,
        answer_options: quiz_questions.answer_options,
      })
      .from(quiz_questions)
      .where(eq(quiz_questions.quiz_id, quizId))
      .orderBy(quiz_questions.question_order);

    return NextResponse.json(questionsData);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = parseInt(params.id);

    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      question_text,
      question_type,
      points,
      correct_answer,
      answer_options,
      explanation
    } = body;

    // Get the next question order
    const maxOrderResult = await db
      .select({ maxOrder: max(quiz_questions.question_order) })
      .from(quiz_questions)
      .where(eq(quiz_questions.quiz_id, quizId));

    const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1;

    // Process answer options based on question type
    let processedOptions = null;
    if (question_type === 'multiple_choice' && answer_options) {
      // Filter out empty options and store as JSON array
      processedOptions = answer_options.filter((option: string) => option.trim());
    }

    const [newQuestion] = await db
      .insert(quiz_questions)
      .values({
        quiz_id: quizId,
        question_text,
        question_type,
        correct_answer,
        answer_options: processedOptions,
        explanation: explanation || null,
        points: points || 1,
        question_order: nextOrder,
      })
      .returning();

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 