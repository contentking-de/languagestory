import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const lessonsData = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        lesson_type: lessons.lesson_type,
        lesson_order: lessons.lesson_order,
        estimated_duration: lessons.estimated_duration,
        points_value: lessons.points_value,
        is_published: lessons.is_published,
      })
      .from(lessons)
      .where(eq(lessons.course_id, courseId))
      .orderBy(lessons.lesson_order);

    return NextResponse.json(lessonsData);
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course lessons' },
      { status: 500 }
    );
  }
} 