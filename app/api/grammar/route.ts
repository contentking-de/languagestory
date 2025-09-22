import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { topics, lessons, courses } from '@/lib/db/content-schema';
import { and, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const rows = await db
      .select({
        id: topics.id,
        title: topics.title,
        points_value: topics.points_value,
        is_published: topics.is_published,
        created_at: topics.created_at,
        lesson_id: topics.lesson_id,
        lesson_title: lessons.title,
        course_title: courses.title,
        course_language: courses.language,
        exercises_count: sql<number>`COALESCE(json_array_length((${topics.interactive_data})->'exercises'), 0)`,
        questions_count: sql<number>`COALESCE(json_array_length((${topics.interactive_data})->'questions'), 0)`
      })
      .from(topics)
      .leftJoin(lessons, eq(topics.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(topics.topic_type, 'grammar_exercise'));

    return NextResponse.json(rows.map(r => ({
      ...r,
      total_items: (r.exercises_count || 0) + (r.questions_count || 0)
    })));
  } catch (error) {
    console.error('Error fetching grammar topics:', error);
    return NextResponse.json({ error: 'Failed to fetch grammar topics' }, { status: 500 });
  }
}

