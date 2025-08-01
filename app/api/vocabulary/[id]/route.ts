import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { vocabulary, lessons, courses } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vocabularyId = parseInt(id);

    if (isNaN(vocabularyId)) {
      return NextResponse.json(
        { error: 'Invalid vocabulary ID' },
        { status: 400 }
      );
    }

    const [vocabularyData] = await db
      .select({
        id: vocabulary.id,
        word_french: vocabulary.word_french,
        word_german: vocabulary.word_german,
        word_spanish: vocabulary.word_spanish,
        word_english: vocabulary.word_english,
        pronunciation: vocabulary.pronunciation,
        phonetic: vocabulary.phonetic,
        audio_file: vocabulary.audio_file,
        image_file: vocabulary.image_file,
        context_sentence: vocabulary.context_sentence,
        cultural_note: vocabulary.cultural_note,
        difficulty_level: vocabulary.difficulty_level,
        word_type: vocabulary.word_type,
        lesson_id: vocabulary.lesson_id,
        topic_id: vocabulary.topic_id,
        created_at: vocabulary.created_at,
        lesson_title: lessons.title,
        course_title: courses.title,
        course_language: courses.language,
        course_level: courses.level,
      })
      .from(vocabulary)
      .leftJoin(lessons, eq(vocabulary.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(vocabulary.id, vocabularyId))
      .limit(1);

    if (!vocabularyData) {
      return NextResponse.json(
        { error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vocabularyData);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
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
    const vocabularyId = parseInt(id);

    if (isNaN(vocabularyId)) {
      return NextResponse.json(
        { error: 'Invalid vocabulary ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      word_french,
      word_german,
      word_spanish,
      word_english,
      pronunciation,
      phonetic,
      audio_file,
      image_file,
      context_sentence,
      cultural_note,
      difficulty_level,
      word_type,
      lesson_id,
      topic_id
    } = body;

    if (!word_english) {
      return NextResponse.json(
        { error: 'English word is required' },
        { status: 400 }
      );
    }

    const [updatedVocabulary] = await db
      .update(vocabulary)
      .set({
        word_french,
        word_german,
        word_spanish,
        word_english,
        pronunciation,
        phonetic,
        audio_file,
        image_file,
        context_sentence,
        cultural_note,
        difficulty_level: difficulty_level || 1,
        word_type,
        lesson_id: lesson_id || null,
        topic_id: topic_id || null,
      })
      .where(eq(vocabulary.id, vocabularyId))
      .returning();

    if (!updatedVocabulary) {
      return NextResponse.json(
        { error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVocabulary);
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to update vocabulary' },
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
    const vocabularyId = parseInt(id);

    if (isNaN(vocabularyId)) {
      return NextResponse.json(
        { error: 'Invalid vocabulary ID' },
        { status: 400 }
      );
    }

    const [deletedVocabulary] = await db
      .delete(vocabulary)
      .where(eq(vocabulary.id, vocabularyId))
      .returning();

    if (!deletedVocabulary) {
      return NextResponse.json(
        { error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vocabulary deleted successfully' });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to delete vocabulary' },
      { status: 500 }
    );
  }
}