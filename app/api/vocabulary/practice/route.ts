import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { vocabulary, lessons, courses } from '@/lib/db/content-schema';
import { eq, and, sql, isNotNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const difficultyLevel = searchParams.get('difficulty');
    const lessonId = searchParams.get('lessonId');
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 50);

    if (!language || !['french', 'german', 'spanish'].includes(language)) {
      return NextResponse.json(
        { error: 'Valid language parameter is required (french, german, spanish)' },
        { status: 400 }
      );
    }

    const wordColumn = language === 'french' 
      ? vocabulary.word_french 
      : language === 'german' 
        ? vocabulary.word_german 
        : vocabulary.word_spanish;

    const conditions = [
      isNotNull(wordColumn),
      sql`TRIM(${wordColumn}) != ''`,
      isNotNull(vocabulary.word_english),
      sql`TRIM(${vocabulary.word_english}) != ''`,
    ];

    if (difficultyLevel && difficultyLevel !== 'all') {
      conditions.push(eq(vocabulary.difficulty_level, parseInt(difficultyLevel)));
    }

    if (lessonId && lessonId !== 'all') {
      conditions.push(eq(vocabulary.lesson_id, parseInt(lessonId)));
    }

    const words = await db
      .select({
        id: vocabulary.id,
        word: wordColumn,
        word_english: vocabulary.word_english,
        difficulty_level: vocabulary.difficulty_level,
        lesson_id: vocabulary.lesson_id,
        lesson_title: lessons.title,
      })
      .from(vocabulary)
      .leftJoin(lessons, eq(vocabulary.lesson_id, lessons.id))
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(count);

    return NextResponse.json({ 
      words,
      total: words.length,
    });
  } catch (error) {
    console.error('Error fetching practice vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary for practice' },
      { status: 500 }
    );
  }
}
