import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses, vocabulary, topics, quizzes, quiz_questions, cultural_content, games, student_progress, achievements } from '@/lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { getUserWithTeamData } from '@/lib/db/queries';

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

    const [lessonData] = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        slug: lessons.slug,
        description: lessons.description,
        content: lessons.content,
        lesson_type: lessons.lesson_type,
        lesson_order: lessons.lesson_order,
        estimated_duration: lessons.estimated_duration,
        points_value: lessons.points_value,
        is_published: lessons.is_published,
        created_at: lessons.created_at,
        course_id: lessons.course_id,
        course_title: courses.title,
        course_language: courses.language,
        course_level: courses.level,
        cover_image: lessons.cover_image,
        audio_file: lessons.audio_file,
        video_file: lessons.video_file,
        cultural_information: lessons.cultural_information,
        flow_order: lessons.flow_order,
      })
      .from(lessons)
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!lessonData) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Also fetch lesson vocabulary (assigned directly to lesson)
    const vocab = await db
      .select({
        id: vocabulary.id,
        word_english: vocabulary.word_english,
        word_french: vocabulary.word_french,
        word_german: vocabulary.word_german,
        word_spanish: vocabulary.word_spanish,
        pronunciation: vocabulary.pronunciation,
        phonetic: vocabulary.phonetic,
        context_sentence: vocabulary.context_sentence,
        difficulty_level: vocabulary.difficulty_level,
        word_type: vocabulary.word_type,
      })
      .from(vocabulary)
      .where(eq(vocabulary.lesson_id, lessonId));

    // Fetch lesson topics (stories + grammar)
    const lessonTopics = await db
      .select({ id: topics.id, title: topics.title, content: topics.content, topic_type: topics.topic_type, interactive_data: topics.interactive_data })
      .from(topics)
      .where(eq(topics.lesson_id, lessonId));

    const storyTopics = lessonTopics
      .filter((t: any) => t?.topic_type === 'story_page')
      .map((t: any) => ({ id: t.id, title: t.title, content: t.content }));

    const grammarTopics = lessonTopics
      .filter((t: any) => t?.topic_type === 'grammar_exercise')
      .map((t: any) => ({ id: t.id, title: t.title, exercises: (t?.interactive_data?.exercises || []) }));

    return NextResponse.json({ ...lessonData, vocabulary: vocab, stories: storyTopics, grammar: grammarTopics });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
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
    const lessonId = parseInt(id);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      slug, 
      description, 
      content, 
      lesson_type, 
      lesson_order, 
      estimated_duration, 
      points_value, 
      is_published,
      course_id,
      cover_image,
      audio_file,
      video_file,
      cultural_information,
      flow_order
    } = body;

    const [updatedLesson] = await db
      .update(lessons)
      .set({
        title: title ?? undefined,
        slug: slug ?? undefined,
        description: description ?? undefined,
        content: content ?? undefined,
        lesson_type: lesson_type ?? undefined,
        lesson_order: typeof lesson_order === 'number' ? lesson_order : undefined,
        estimated_duration: typeof estimated_duration === 'number' ? estimated_duration : undefined,
        points_value: typeof points_value === 'number' ? points_value : undefined,
        is_published: typeof is_published === 'boolean' ? is_published : undefined,
        course_id: typeof course_id === 'number' ? course_id : undefined,
        cover_image: cover_image ?? undefined,
        audio_file: audio_file ?? undefined,
        video_file: video_file ?? undefined,
        cultural_information: cultural_information ?? undefined,
        flow_order: Array.isArray(flow_order) ? flow_order : undefined,
        updated_at: new Date(),
      })
      .where(eq(lessons.id, lessonId))
      .returning();

    if (!updatedLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
} 

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || (user.role !== 'super_admin' && user.role !== 'content_creator')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const lessonId = parseInt(id);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    // Collect quizzes related to this lesson directly or via lesson topics
    const lessonTopics = await db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.lesson_id, lessonId));
    const topicIds = lessonTopics.map(t => t.id);

    const relatedQuizzes = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(
        topicIds.length > 0
          ? inArray(quizzes.topic_id, topicIds)
          : eq(quizzes.lesson_id, lessonId)
      );
    const quizIds = relatedQuizzes.map(q => q.id);

    // Delete dependent records in safe order
    if (quizIds.length > 0) {
      await db.delete(quiz_questions).where(inArray(quiz_questions.quiz_id, quizIds));
      await db.delete(quizzes).where(inArray(quizzes.id, quizIds));
    }

    if (topicIds.length > 0) {
      await db.delete(topics).where(inArray(topics.id, topicIds));
    }

    await db.delete(vocabulary).where(eq(vocabulary.lesson_id, lessonId));
    await db.delete(cultural_content).where(eq(cultural_content.lesson_id, lessonId));
    await db.delete(games).where(eq(games.lesson_id, lessonId));
    await db.delete(student_progress).where(eq(student_progress.lesson_id, lessonId));
    await db.delete(achievements).where(eq(achievements.lesson_id, lessonId));

    // Finally delete the lesson
    const deleted = await db.delete(lessons).where(eq(lessons.id, lessonId)).returning();
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}