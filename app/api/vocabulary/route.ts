import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { vocabulary, lessons, courses } from '@/lib/db/content-schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const vocabularyData = await db
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
      })
      .from(vocabulary)
      .leftJoin(lessons, eq(vocabulary.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .orderBy(desc(vocabulary.created_at));

    return NextResponse.json(vocabularyData);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      word_french,
      word_german,
      word_spanish,
      word_english,
      pronunciation,
      phonetic,
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

    const [newVocabulary] = await db
      .insert(vocabulary)
      .values({
        word_french,
        word_german,
        word_spanish,
        word_english,
        pronunciation,
        phonetic,
        context_sentence,
        cultural_note,
        difficulty_level: difficulty_level || 1,
        word_type,
        lesson_id,
        topic_id,
      })
      .returning();

    return NextResponse.json(newVocabulary, { status: 201 });
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to create vocabulary' },
      { status: 500 }
    );
  }
} 