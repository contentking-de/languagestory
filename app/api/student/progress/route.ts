import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { student_progress } from '@/lib/db/content-schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      student_id, 
      lesson_id, 
      quiz_id, 
      status, 
      score, 
      time_spent, 
      points_earned 
    } = body;

    // Validate required fields
    if (!student_id || !lesson_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if progress record already exists
    const existingProgress = await db
      .select()
      .from(student_progress)
      .where(
        and(
          eq(student_progress.student_id, student_id),
          eq(student_progress.lesson_id, lesson_id),
          quiz_id ? eq(student_progress.quiz_id, quiz_id) : undefined
        )
      )
      .limit(1);

    if (existingProgress.length > 0) {
      // Update existing progress
      const [updatedProgress] = await db
        .update(student_progress)
        .set({
          status,
          score: score || existingProgress[0].score,
          time_spent: time_spent || existingProgress[0].time_spent,
          points_earned: points_earned || existingProgress[0].points_earned,
          last_accessed: new Date(),
          completed_at: status === 'completed' ? new Date() : existingProgress[0].completed_at,
        })
        .where(eq(student_progress.id, existingProgress[0].id))
        .returning();

      return NextResponse.json(updatedProgress);
    } else {
      // Create new progress record
      const [newProgress] = await db
        .insert(student_progress)
        .values({
          student_id,
          lesson_id,
          quiz_id,
          status,
          score,
          time_spent: time_spent || 0,
          points_earned: points_earned || 0,
          last_accessed: new Date(),
          completed_at: status === 'completed' ? new Date() : null,
        })
        .returning();

      return NextResponse.json(newProgress);
    }
  } catch (error) {
    console.error('Error updating student progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
} 