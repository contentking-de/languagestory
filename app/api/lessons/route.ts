import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get('fields');

    const user = await getUser();
    const canSeeAllStatuses = user?.role === 'super_admin' || user?.role === 'content_creator';

    const publishedFilter = canSeeAllStatuses ? undefined : eq(lessons.is_published, true);

    // Minimal mode: only return fields needed for dropdowns/selectors (much faster)
    if (fields === 'minimal') {
      const query = db
        .select({
          id: lessons.id,
          title: lessons.title,
          course_id: lessons.course_id,
          course_title: courses.title,
          course_language: courses.language,
        })
        .from(lessons)
        .leftJoin(courses, eq(lessons.course_id, courses.id));

      const lessonsData = publishedFilter
        ? await query.where(publishedFilter).orderBy(courses.language, lessons.lesson_order)
        : await query.orderBy(courses.language, lessons.lesson_order);

      return NextResponse.json(lessonsData);
    }

    // Full mode: return all fields
    const query = db
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
      .leftJoin(courses, eq(lessons.course_id, courses.id));

    const lessonsData = publishedFilter
      ? await query.where(publishedFilter).orderBy(courses.language, lessons.lesson_order)
      : await query.orderBy(courses.language, lessons.lesson_order);

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