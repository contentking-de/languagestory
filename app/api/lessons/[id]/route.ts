import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    return NextResponse.json(lessonData);
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
      cover_image,
      audio_file,
      video_file,
      cultural_information
    } = body;

    const [updatedLesson] = await db
      .update(lessons)
      .set({
        title,
        slug,
        description,
        content,
        lesson_type,
        lesson_order,
        estimated_duration,
        points_value,
        is_published,
        cover_image,
        audio_file,
        video_file,
        cultural_information,
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