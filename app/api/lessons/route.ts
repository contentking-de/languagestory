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

export async function POST(request: Request) {
  try {
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
      course_id 
    } = body;

    const [newLesson] = await db
      .insert(lessons)
      .values({
        title,
        slug,
        description,
        content,
        lesson_type,
        lesson_order: lesson_order || 1,
        estimated_duration: estimated_duration || 30,
        points_value: points_value || 10,
        is_published: is_published || false,
        course_id,
      })
      .returning();

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
} 