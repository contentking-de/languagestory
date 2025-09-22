import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { topics } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topicId = parseInt(id);
    if (isNaN(topicId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const deleted = await db.delete(topics).where(eq(topics.id, topicId)).returning();
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete topic failed', e);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topicId = parseInt(id);
    if (isNaN(topicId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const [row] = await db.select().from(topics).where(eq(topics.id, topicId)).limit(1);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) {
    console.error('Fetch topic failed', e);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topicId = parseInt(id);
    if (isNaN(topicId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const body = await request.json();
    const { title, is_published, interactive_data } = body;
    // Robustly coerce lesson_id from payload
    let lessonIdValue: number | null | undefined;
    const rawLessonId = (body as any).lesson_id;
    if (rawLessonId === null || rawLessonId === 'none') {
      lessonIdValue = null;
    } else if (typeof rawLessonId === 'string') {
      const parsed = parseInt(rawLessonId, 10);
      lessonIdValue = Number.isFinite(parsed) ? parsed : undefined;
    } else if (typeof rawLessonId === 'number') {
      lessonIdValue = Number.isFinite(rawLessonId) ? rawLessonId : undefined;
    } else {
      lessonIdValue = undefined;
    }
    const [updated] = await db
      .update(topics)
      .set({
        title: typeof title === 'string' ? title : undefined,
        is_published: typeof is_published === 'boolean' ? is_published : undefined,
        interactive_data: interactive_data !== undefined ? interactive_data : undefined,
        lesson_id: lessonIdValue,
      })
      .where(eq(topics.id, topicId))
      .returning();
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('Update topic failed', e);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

