import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { quizzes, quiz_questions, vocabulary } from '@/lib/db/content-schema';
import { logQuizActivityServer, logVocabularyActivityServer } from '@/lib/activity-logger-server';

export async function POST(request: Request) {
  try {
    const { contentType, data, lessonId, customName } = await request.json();
    
    console.log('Save API called with:');
    console.log('contentType:', contentType);
    console.log('data:', JSON.stringify(data, null, 2));
    console.log('lessonId:', lessonId);
    console.log('customName:', customName);

    if (!contentType || !data) {
      console.log('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let savedCount = 0;

    switch (contentType) {
      case 'quiz':
        console.log('About to call saveQuizContent');
        savedCount = await saveQuizContent(data, lessonId, customName, 'multiple_choice');
        console.log('saveQuizContent returned:', savedCount);
        break;
      
      case 'true_false_quiz':
        console.log('About to call saveTrueFalseQuizContent');
        savedCount = await saveQuizContent(data, lessonId, customName, 'true_false');
        console.log('saveTrueFalseQuizContent returned:', savedCount);
        break;
      
      case 'vocabulary':
        savedCount = await saveVocabularyContent(data, lessonId);
        break;
      
      // TODO: Implement other content types
      case 'story':
      case 'conversation':
      case 'grammar':
        return NextResponse.json(
          { error: `Saving ${contentType} content is not yet implemented. Coming soon!` },
          { status: 501 }
        );
      
      default:
        return NextResponse.json(
          { error: 'Unsupported content type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      count: savedCount,
      message: `Successfully saved ${savedCount} ${contentType} item(s)`
    });

  } catch (error) {
    console.error('Save content error:', error);
    return NextResponse.json(
      { error: 'Failed to save content to database' },
      { status: 500 }
    );
  }
}

async function saveQuizContent(data: any, lessonId?: number, customName?: string, quizType: 'multiple_choice' | 'true_false' = 'multiple_choice'): Promise<number> {
  console.log('saveQuizContent called with data:', JSON.stringify(data, null, 2));
  console.log('lessonId:', lessonId);
  console.log('customName:', customName);
  console.log('quizType:', quizType);
  
  const questions = data.questions || [];
  console.log('Extracted questions:', questions);
  console.log('Questions array length:', questions.length);
  console.log('Is questions array?', Array.isArray(questions));
  
  if (!Array.isArray(questions) || questions.length === 0) {
    console.log('No questions found - throwing error');
    throw new Error('No questions found in data');
  }

  try {
    // Create ONE quiz with a descriptive title
    const firstQuestion = questions[0];
    const quizTitle = customName || `AI Generated Quiz (${questions.length} questions)`;
    
    const quizValues = {
      title: quizTitle,
      description: `AI generated ${quizType === 'true_false' ? 'true/false' : 'multiple choice'} quiz with ${questions.length} questions`,
      quiz_type: quizType,
      lesson_id: lessonId || null,
      topic_id: null,
      pass_percentage: 70,
      points_value: questions.length * 5, // 5 points per question
      is_published: false,
    };
    console.log('About to insert quiz with values:', quizValues);
    
    const [savedQuiz] = await db
      .insert(quizzes)
      .values(quizValues)
      .returning();
      
    console.log('Saved quiz:', savedQuiz);

    if (!savedQuiz) {
      throw new Error('Failed to create quiz');
    }

    // Now save ALL questions to this ONE quiz
    console.log('Quiz saved successfully, now saving all questions');
    
    for (let i = 0; i < questions.length; i++) {
      const questionData = questions[i];
      console.log(`Processing question ${i + 1}/${questions.length}:`, questionData);
      
      let correctAnswer;
      let answerOptions = null;
      
      if (quizType === 'multiple_choice') {
        // Find the correct answer option text
        // AI returns correct_answer as "A", "B", etc. but options are "A) Text", "B) Text"
        const correctAnswerLetter = questionData.correct_answer;
        const options = questionData.options || [];
        correctAnswer = options.find((option: string) => 
          option.startsWith(correctAnswerLetter + ')')
        ) || correctAnswerLetter;
        answerOptions = options;
        
        console.log('Multiple choice - Correct answer letter:', correctAnswerLetter);
        console.log('Multiple choice - Options:', options);
        console.log('Multiple choice - Found correct answer text:', correctAnswer);
      } else if (quizType === 'true_false') {
        // For true/false, the correct answer is already "true" or "false"
        correctAnswer = questionData.correct_answer?.toLowerCase();
        answerOptions = null; // No options array needed for true/false
        
        console.log('True/False - Correct answer:', correctAnswer);
      }
      
      const questionValues = {
        quiz_id: savedQuiz.id,
        question_text: questionData.question,
        question_type: quizType,
        answer_options: answerOptions,
        correct_answer: correctAnswer,
        explanation: questionData.explanation,
        points: 1,
        question_order: i + 1, // Proper ordering: 1, 2, 3, etc.
      };
      console.log('About to insert question with values:', questionValues);
      
      await db
        .insert(quiz_questions)
        .values(questionValues);
        
      console.log(`Successfully saved question ${i + 1}`);
    }

    console.log(`Successfully saved 1 quiz with ${questions.length} questions`);
    
    // Log the activity after successful quiz creation
    await logQuizActivityServer('CREATE_QUIZ');
    
    return 1; // Return 1 because we created 1 quiz
    
  } catch (error) {
    console.error('Error saving quiz:', error);
    console.error('Error details:', error);
    throw error;
  }
}

async function saveVocabularyContent(data: any, lessonId?: number): Promise<number> {
  const words = data.words || [];
  if (!Array.isArray(words) || words.length === 0) {
    throw new Error('No vocabulary words found in data');
  }

  let savedCount = 0;

  for (const wordData of words) {
    try {
      await db
        .insert(vocabulary)
        .values({
          word_french: wordData.word_french || null,
          word_german: wordData.word_german || null,
          word_spanish: wordData.word_spanish || null,
          word_english: wordData.word_english || '',
          pronunciation: wordData.pronunciation || null,
          phonetic: wordData.phonetic || null,
          context_sentence: wordData.context_sentence || null,
          cultural_note: wordData.cultural_note || null,
          difficulty_level: wordData.difficulty_level || 1,
          word_type: wordData.word_type || null,
          lesson_id: lessonId || null,
          topic_id: null, // TODO: Implement topic assignment
        });

      savedCount++;
    } catch (error) {
      console.error('Error saving vocabulary word:', error);
      // Continue with next word rather than failing completely
    }
  }

  // Log the activity after successful vocabulary creation
  if (savedCount > 0) {
    await logVocabularyActivityServer('CREATE_VOCABULARY');
  }

  return savedCount;
}