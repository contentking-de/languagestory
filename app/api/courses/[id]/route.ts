import { NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { courses, users } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { 
  lessons, 
  quizzes, 
  quiz_questions, 
  vocabulary, 
  achievements,
  student_progress
} from '@/lib/db/content-schema';

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and permissions
    const user = await getUserWithTeamData();
    if (!user || (user.role !== 'super_admin' && user.role !== 'content_creator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Check if course exists
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this course
    if (user.role !== 'super_admin' && course.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete courses you created' },
        { status: 403 }
      );
    }

    // Delete related data in the correct order (due to foreign key constraints)
    
    // 1. Delete achievements for this course
    await db.delete(achievements).where(eq(achievements.course_id, courseId));
    
    // 2. Delete student progress for this course
    await db.delete(student_progress).where(eq(student_progress.course_id, courseId));
    
    // 3. Get all lessons in this course first
    const courseLessons = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.course_id, courseId));
    const lessonIds = courseLessons.map(lesson => lesson.id);
    
    if (lessonIds.length > 0) {
      // 4. Delete quiz questions for quizzes in lessons of this course
      const courseQuizzes = await db.select({ id: quizzes.id }).from(quizzes).where(inArray(quizzes.lesson_id, lessonIds));
      for (const quiz of courseQuizzes) {
        await db.delete(quiz_questions).where(eq(quiz_questions.quiz_id, quiz.id));
      }
      
      // 5. Delete quizzes for lessons in this course
      await db.delete(quizzes).where(inArray(quizzes.lesson_id, lessonIds));
      
      // 6. Delete vocabulary for lessons in this course
      await db.delete(vocabulary).where(inArray(vocabulary.lesson_id, lessonIds));
    }
    
    // 7. Delete lessons for this course
    await db.delete(lessons).where(eq(lessons.course_id, courseId));
    
    // 8. Finally, delete the course
    await db.delete(courses).where(eq(courses.id, courseId));

    return NextResponse.json({
      success: true,
      message: 'Course and all related content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
} 