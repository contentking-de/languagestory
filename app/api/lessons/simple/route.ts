import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const lessonsData = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        lesson_type: lessons.lesson_type,
        course_id: lessons.course_id,
        course_title: courses.title,
        course_language: courses.language,
        course_level: courses.level,
      })
      .from(lessons)
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .orderBy(courses.language, lessons.lesson_order);

    return NextResponse.json(lessonsData);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
} 