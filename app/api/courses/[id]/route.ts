import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const [courseData] = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        language: courses.language,
        level: courses.level,
        is_published: courses.is_published,
        total_lessons: courses.total_lessons,
        total_points: courses.total_points,
        estimated_duration: courses.estimated_duration,
        created_at: courses.created_at,
        creator_name: users.name,
      })
      .from(courses)
      .leftJoin(users, eq(courses.created_by, users.id))
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!courseData) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(courseData);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
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
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, slug, description, language, level, is_published, estimated_duration } = body;

    const [updatedCourse] = await db
      .update(courses)
      .set({
        title,
        slug,
        description,
        language,
        level,
        is_published,
        estimated_duration,
        updated_at: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning();

    if (!updatedCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
} 