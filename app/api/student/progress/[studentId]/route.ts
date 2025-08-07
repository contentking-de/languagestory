import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { student_progress } from '@/lib/db/content-schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = await params;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (lessonId) {
      // Fetch progress for a specific lesson
      const progressRecords = await db
        .select()
        .from(student_progress)
        .where(
          and(
            eq(student_progress.student_id, parseInt(studentId)),
            eq(student_progress.lesson_id, parseInt(lessonId))
          )
        );

      return NextResponse.json(progressRecords);
    } else {
      // Fetch general progress data for dashboard
      const allProgress = await db
        .select()
        .from(student_progress)
        .where(eq(student_progress.student_id, parseInt(studentId)));

      // Calculate summary statistics
      const totalLessons = allProgress.filter(p => p.status === 'completed').length;
      const totalPoints = allProgress.reduce((sum, p) => sum + (p.points_earned || 0), 0);
      const recentActivity = allProgress
        .filter(p => p.last_accessed && new Date(p.last_accessed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length;

      return NextResponse.json({
        totalLessons,
        totalPoints,
        recentActivity,
        progressRecords: allProgress
      });
    }
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}