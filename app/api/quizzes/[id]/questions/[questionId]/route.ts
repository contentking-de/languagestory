import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quiz_questions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    const quizId = parseInt(id);
    const questionIdNum = parseInt(questionId);

    if (isNaN(quizId) || isNaN(questionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID or question ID' },
        { status: 400 }
      );
    }

    const [questionData] = await db
      .select({
        id: quiz_questions.id,
        question_text: quiz_questions.question_text,
        question_type: quiz_questions.question_type,
        points: quiz_questions.points,
        correct_answer: quiz_questions.correct_answer,
        answer_options: quiz_questions.answer_options,
        explanation: quiz_questions.explanation,
        quiz_id: quiz_questions.quiz_id,
      })
      .from(quiz_questions)
      .where(and(
        eq(quiz_questions.quiz_id, quizId),
        eq(quiz_questions.id, questionIdNum)
      ))
      .limit(1);

    if (!questionData) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(questionData);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    const quizId = parseInt(id);
    const questionIdNum = parseInt(questionId);

    if (isNaN(quizId) || isNaN(questionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID or question ID' },
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

    // Check if question exists and belongs to this quiz
    const [existingQuestion] = await db
      .select()
      .from(quiz_questions)
      .where(and(
        eq(quiz_questions.quiz_id, quizId),
        eq(quiz_questions.id, questionIdNum)
      ))
      .limit(1);

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Process answer options based on question type
    let processedOptions = null;
    if (question_type === 'multiple_choice' && answer_options) {
      // Filter out empty options and store as JSON array
      processedOptions = answer_options.filter((option: string) => option.trim());
    }

    const [updatedQuestion] = await db
      .update(quiz_questions)
      .set({
        question_text,
        question_type,
        correct_answer,
        answer_options: processedOptions,
        explanation: explanation || null,
        points: points || 1,
      })
      .where(and(
        eq(quiz_questions.quiz_id, quizId),
        eq(quiz_questions.id, questionIdNum)
      ))
      .returning();

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
    const quizId = parseInt(id);
    const questionIdNum = parseInt(questionId);

    if (isNaN(quizId) || isNaN(questionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID or question ID' },
        { status: 400 }
      );
    }

    // Check if question exists and belongs to this quiz
    const [existingQuestion] = await db
      .select()
      .from(quiz_questions)
      .where(and(
        eq(quiz_questions.quiz_id, quizId),
        eq(quiz_questions.id, questionIdNum)
      ))
      .limit(1);

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    await db
      .delete(quiz_questions)
      .where(and(
        eq(quiz_questions.quiz_id, quizId),
        eq(quiz_questions.id, questionIdNum)
      ));

    return NextResponse.json(
      { message: 'Question deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}