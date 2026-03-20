import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses } from '@/lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';

// Fixed story IDs per language for fast, deterministic teaser loading.
// Audio is pre-generated and cached for these lessons.
const TEASER_STORY_IDS: Record<string, number[]> = {
  spanish: [1039, 1029, 1045],
  german:  [939, 734, 904],
  french:  [692, 673, 681],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const index = parseInt(searchParams.get('index') || '0');

    if (!language || !TEASER_STORY_IDS[language]) {
      return NextResponse.json(
        { error: 'Invalid or missing language parameter. Use: spanish, german, or french.' },
        { status: 400 }
      );
    }

    const ids = TEASER_STORY_IDS[language];
    const safeIndex = Math.abs(index) % ids.length;
    const lessonId = ids[safeIndex];

    const [row] = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        content: lessons.content,
        contentAudioUrl: lessons.content_audio_url,
        courseTitle: courses.title,
        courseLanguage: courses.language,
      })
      .from(lessons)
      .innerJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { error: `Story not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: row.id,
      title: row.title,
      content: row.content,
      audioUrl: row.contentAudioUrl || null,
      lessonTitle: row.title,
      courseTitle: row.courseTitle,
      courseLanguage: row.courseLanguage,
      totalStories: ids.length,
      currentIndex: safeIndex,
    });
  } catch (error) {
    console.error('Error fetching story teaser:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}
