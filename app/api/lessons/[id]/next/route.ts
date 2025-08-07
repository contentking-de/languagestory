import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lessons, courses } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

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

    // First, get the current lesson to find its course_id and lesson_order
    const [currentLesson] = await db
      .select({
        id: lessons.id,
        course_id: lessons.course_id,
        lesson_order: lessons.lesson_order,
      })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!currentLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Find the next lesson in the same course
    const [nextLesson] = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        slug: lessons.slug,
        lesson_order: lessons.lesson_order,
        course_id: lessons.course_id,
        course_title: courses.title,
        is_published: lessons.is_published,
      })
      .from(lessons)
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(
        and(
          eq(lessons.course_id, currentLesson.course_id),
          gt(lessons.lesson_order, currentLesson.lesson_order),
          eq(lessons.is_published, true)
        )
      )
      .orderBy(lessons.lesson_order)
      .limit(1);

    if (!nextLesson) {
      // No next lesson found - check if there's another course
      const [nextCourse] = await db
        .select({
          id: courses.id,
          title: courses.title,
          language: courses.language,
          level: courses.level,
        })
        .from(courses)
        .where(gt(courses.id, currentLesson.course_id))
        .orderBy(courses.id)
        .limit(1);

      if (nextCourse) {
        // Get the first lesson of the next course
        const [firstLessonNextCourse] = await db
          .select({
            id: lessons.id,
            title: lessons.title,
            slug: lessons.slug,
            lesson_order: lessons.lesson_order,
            course_id: lessons.course_id,
            course_title: courses.title,
            is_published: lessons.is_published,
          })
          .from(lessons)
          .leftJoin(courses, eq(lessons.course_id, courses.id))
          .where(
            and(
              eq(lessons.course_id, nextCourse.id),
              eq(lessons.is_published, true)
            )
          )
          .orderBy(lessons.lesson_order)
          .limit(1);

        if (firstLessonNextCourse) {
          return NextResponse.json({
            nextLesson: firstLessonNextCourse,
            isNextCourse: true,
            nextCourse: nextCourse
          });
        }
      }

      // No next lesson or course found
      return NextResponse.json({
        nextLesson: null,
        isNextCourse: false,
        nextCourse: null
      });
    }

    return NextResponse.json({
      nextLesson,
      isNextCourse: false,
      nextCourse: null
    });
  } catch (error) {
    console.error('Error fetching next lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch next lesson' },
      { status: 500 }
    );
  }
}
