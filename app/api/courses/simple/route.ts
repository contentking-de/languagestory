import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses } from '@/lib/db/schema';

export async function GET() {
  try {
    const coursesData = await db
      .select({
        id: courses.id,
        title: courses.title,
        language: courses.language,
        level: courses.level,
      })
      .from(courses)
      .orderBy(courses.language, courses.title);

    return NextResponse.json(coursesData);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
} 