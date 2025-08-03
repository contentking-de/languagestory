import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quizzes, lessons, courses, quiz_questions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Helper function to automatically generate gap fill questions
async function generateGapFillQuestions(quizId: number, gapFillConfig: any) {
  const { original_text, text_content, word_bank, correct_order } = gapFillConfig;
  
  if (!text_content || !text_content.includes('[BLANK]')) {
    return;
  }

  // Split text by [BLANK] to get the gaps
  const textParts = text_content.split('[BLANK]');
  const numGaps = textParts.length - 1;

  if (numGaps === 0) {
    return;
  }

  // Parse word bank (assuming comma-separated or line-separated)
  const wordBankArray = word_bank ? 
    word_bank.split(/[,\n]/).map((word: string) => word.trim()).filter((word: string) => word.length > 0) : 
    [];

  // Use the correct order from the frontend auto-replacement
  let correctAnswersArray = [];
  
  if (correct_order && correct_order.trim()) {
    // Use the correct order provided by the frontend
    correctAnswersArray = correct_order.split('|').filter((word: string) => word.trim());
  } else {
    // Fallback: use the first words from word bank (for backward compatibility)
    const words = wordBankArray.slice();
    for (let i = 0; i < numGaps && i < words.length; i++) {
      correctAnswersArray.push(words[i]);
    }
  }
  
  const questions = [{
    quiz_id: quizId,
    question_text: text_content, // Store the original text with [BLANK] placeholders
    question_type: 'fill_blank' as const, // Use the database enum value
    correct_answer: correctAnswersArray.join('|'), // Store correct answers separated by |
    answer_options: wordBankArray, // Store full word bank for drag & drop
    explanation: `This gap-fill exercise has ${numGaps} gaps to complete using the provided word bank.`,
    points: Math.max(1, numGaps), // At least 1 point
    question_order: 1,
  }];

  // Insert the question
  if (questions.length > 0) {
    await db.insert(quiz_questions).values(questions);
  }
}

export async function GET() {
  try {
    const quizzesData = await db
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
      })
      .from(quizzes)
      .leftJoin(lessons, eq(quizzes.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .orderBy(quizzes.created_at);

    return NextResponse.json(quizzesData);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title,
      description,
      quiz_type,
      pass_percentage,
      time_limit,
      max_attempts,
      points_value,
      is_published,
      lesson_id,
      topic_id,
      // Quiz type specific configurations
      mc_num_questions,
      mc_num_options,
      mc_randomize_options,
      mc_multiple_correct,
      gf_original_text,
      gf_text_content,
      gf_num_gaps,
      gf_word_bank,
      gf_correct_order,
      gf_difficulty,
      gf_allow_hints,
      tf_num_questions,
      tf_show_explanations,
      tf_randomize_order,
      tf_immediate_feedback
    } = body;

    // Create configuration object based on quiz type (excluding description)
    const config: any = {};

    if (quiz_type === 'multiple_choice') {
      config.multiple_choice = {
        num_questions: mc_num_questions || 5,
        num_options: mc_num_options || 4,
        randomize_options: mc_randomize_options || true,
        multiple_correct: mc_multiple_correct || false,
      };
    } else if (quiz_type === 'gap_fill') {
      config.gap_fill = {
        original_text: gf_original_text || '',
        text_content: gf_text_content || '',
        num_gaps: gf_num_gaps || 5,
        word_bank: gf_word_bank || '',
        correct_order: gf_correct_order || '',
        difficulty: gf_difficulty || 'medium',
        allow_hints: gf_allow_hints || true,
      };
    } else if (quiz_type === 'true_false') {
      config.true_false = {
        num_questions: tf_num_questions || 10,
        show_explanations: tf_show_explanations || true,
        randomize_order: tf_randomize_order || true,
        immediate_feedback: tf_immediate_feedback || false,
      };
    }

    // Store configuration and description separately
    const fullDescription = {
      description: description || '',
      config: config
    };

    const [newQuiz] = await db
      .insert(quizzes)
      .values({
        title,
        description: JSON.stringify(fullDescription),
        quiz_type,
        pass_percentage: pass_percentage || 70,
        time_limit: time_limit || 0,
        max_attempts: max_attempts || 0,
        points_value: points_value || 10,
        is_published: is_published || false,
        lesson_id,
        topic_id,
      })
      .returning();

    // Automatically generate questions for gap fill quizzes
    if (quiz_type === 'gap_fill' && config.gap_fill) {
      await generateGapFillQuestions(newQuiz.id, config.gap_fill);
    }

    return NextResponse.json(newQuiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 