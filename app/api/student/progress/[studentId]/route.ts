import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { student_progress } from '@/lib/db/content-schema';
import { eq, and } from 'drizzle-orm';
import { getStudentProgress } from '@/lib/gamification';

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
      // Fetch general progress data for dashboard using getStudentProgress
      // This includes achievements, streaks, transactions, etc.
      const progressData = await getStudentProgress(parseInt(studentId));
      
      // Also get lesson progress for totalLessons calculation
      // Only count lessons without quiz_id (entire lessons, not individual quiz steps)
      const allProgress = await db
        .select()
        .from(student_progress)
        .where(eq(student_progress.student_id, parseInt(studentId)));

      const totalLessons = allProgress.filter(p => 
        p.status === 'completed' && !p.quiz_id
      ).length;

      return NextResponse.json({
        ...progressData,
        totalLessons,
        totalPoints: progressData.streak?.total_points || 0,
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