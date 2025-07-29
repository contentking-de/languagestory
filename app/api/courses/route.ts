import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const coursesData = await db
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
      .orderBy(courses.created_at);

    return NextResponse.json(coursesData);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, language, level, is_published, estimated_duration } = body;

    // For now, we'll use a default user ID (1) - in a real app, this would come from authentication
    const defaultUserId = 1;

    const [newCourse] = await db
      .insert(courses)
      .values({
        title,
        slug,
        description,
        language,
        level,
        is_published: is_published || false,
        estimated_duration: estimated_duration || 0,
        created_by: defaultUserId,
        total_lessons: 0,
        total_points: 0,
        course_order: 0,
      })
      .returning();

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 