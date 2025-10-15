import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { quizzes, quiz_questions, vocabulary, media_files, topics, lessons } from '@/lib/db/content-schema';
import { logQuizActivityServer, logVocabularyActivityServer } from '@/lib/activity-logger-server';
import { put } from '@vercel/blob';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const { contentType, data, lessonId, customName, imagePrompt, imageMime } = await request.json();
    
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

    let savedUrl: string | undefined;
    let savedFilename: string | undefined;

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
      case 'story':
        savedCount = await saveStoryContent(data, lessonId);
        break;
      case 'cultural':
        savedCount = await saveCulturalInformation(data, lessonId);
        break;
      case 'grammar':
        // Save as a grammar topic with MC-style questions in interactive_data
        savedCount = await saveGrammarContent({ ...data, title: customName || data?.title }, lessonId);
        break;
      case 'image': {
        const user = await getUserWithTeamData();
        const saved = await saveImageToBlob(data, imagePrompt, imageMime);
        savedUrl = saved.url;
        savedFilename = saved.filename;
        // Persist to media_files so it appears in Media Library
        try {
          const blobId = saved.url.split('/').pop()?.split('?')[0] || saved.filename;
          const category = 'images';
          await db.insert(media_files).values({
            blob_id: blobId,
            name: saved.filename,
            url: saved.url,
            size: saved.size,
            type: saved.contentType,
            category,
            uploaded_by: user?.id || 0,
            tags: [],
            metadata: {
              originalName: saved.filename,
              uploadedAt: new Date().toISOString(),
              source: 'ai-creator'
            }
          });
        } catch (e) {
          console.warn('Failed to insert media_files record for AI image:', e);
        }
        savedCount = 1;
        break;
      }
      
      // TODO: Implement other content types
      case 'conversation':
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
      message: `Successfully saved ${savedCount} ${contentType} item(s)`,
      savedUrl,
      savedFilename
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
    const quizTitle = customName || `Quiz (${questions.length} questions)`;
    
    const quizValues = {
      title: quizTitle,
      description: '',
      quiz_type: quizType,
      lesson_id: lessonId || null,
      topic_id: null,
      pass_percentage: 70,
      points_value: questions.length * 5, // 5 points per question
      is_published: true,
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

async function saveStoryContent(data: any, lessonId?: number): Promise<number> {
  const story = data.story;
  if (!story || !story.content) {
    throw new Error('No story content found in data');
  }

  if (typeof lessonId !== 'number') {
    throw new Error('Lesson ID is required to save a story');
  }

  const title: string = story.title || 'AI Generated Story';
  const slug: string = (title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') || `story-${Date.now()}`).slice(0, 80);

  const values = {
    lesson_id: lessonId,
    title,
    slug,
    content: story.content,
    topic_type: 'story_page' as any,
    topic_order: 0,
    difficulty_level: story.difficulty_level || 3,
    points_value: 10,
    is_published: true,
    interactive_data: {
      vocabulary_highlights: story.vocabulary_highlights || [],
      grammar_focus: story.grammar_focus || [],
      estimated_reading_time: story.estimated_reading_time || null,
      source: 'ai-creator'
    },
  };

  await db.insert(topics).values(values);
  return 1;
}

async function saveCulturalInformation(data: any, lessonId?: number): Promise<number> {
  const culturalText: string | undefined = data?.cultural_information || data?.content;
  if (!culturalText || !culturalText.trim()) {
    throw new Error('No cultural information found in data');
  }
  if (typeof lessonId !== 'number') {
    throw new Error('Lesson ID is required to save cultural information');
  }

  await db
    .update(lessons)
    .set({ cultural_information: culturalText })
    .where(eq(lessons.id, lessonId));

  return 1;
}

async function saveGrammarContent(data: any, lessonId?: number): Promise<number> {
  // Accept both MC-style questions and legacy exercises
  const mcQuestions = Array.isArray(data?.questions) ? data.questions : [];
  const legacyExercises = Array.isArray(data?.exercises) ? data.exercises : [];
  if (mcQuestions.length === 0 && legacyExercises.length === 0) {
    throw new Error('No grammar content found in data');
  }

  const title = data.title || 'Grammar Exercises';
  const slug = (title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') || `grammar-${Date.now()}`).slice(0, 80);

  const interactive = {
    // Prefer MC questions for consistency; keep exercises for compatibility
    questions: mcQuestions,
    exercises: legacyExercises,
    metadata: {
      source: 'ai-creator',
      generatedAt: new Date().toISOString(),
    },
  };

  await db.insert(topics).values({
    lesson_id: typeof lessonId === 'number' ? lessonId : null,
    title,
    slug,
    content: null,
    topic_type: 'grammar_exercise' as any,
    topic_order: 0,
    difficulty_level: 3,
    points_value: 10,
    is_published: true,
    interactive_data: interactive,
  });

  return 1;
}

function slugifyFilename(input: string, maxLen = 80): string {
  const base = input
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return base.slice(0, maxLen) || 'image';
}

async function saveImageToBlob(
  data: any,
  prompt?: string,
  imageMime?: string
): Promise<{ url: string; filename: string; size: number; contentType: string }> {
  try {
    const base64 = data?.base64 as string | undefined;
    if (!base64) throw new Error('Missing image base64');
    const buffer = Buffer.from(base64, 'base64');
    let processed: Buffer | null = null;
    let contentType = imageMime || 'image/png';
    let extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1] || 'png';

    try {
      const { optimizeImage } = await import('@/lib/image-opt');
      const out = await optimizeImage(buffer, { maxWidth: 1024, format: 'webp', quality: 70 });
      processed = out.buffer;
      contentType = out.contentType;
      extension = out.extension;
    } catch (e) {
      console.warn('Image compression unavailable, uploading original image. Reason:', e);
      processed = buffer;
      contentType = imageMime || 'image/png';
      extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1] || 'png';
    }

    // Use only the user's short image description (topic) for filename
    const slug = prompt ? slugifyFilename(prompt) : `${Date.now()}`;
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `ai-images/${slug}-${random}.${extension}`;
    const { url } = await put(filename, processed, { access: 'public', contentType });
    return { url, filename, size: processed.byteLength, contentType };
  } catch (err) {
    console.error('Error saving image to blob:', err);
    throw err;
  }
}