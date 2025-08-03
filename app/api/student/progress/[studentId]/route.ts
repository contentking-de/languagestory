import { NextResponse } from 'next/server';
import { getStudentProgress } from '@/lib/gamification';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const studentIdNum = parseInt(studentId);

    if (isNaN(studentIdNum)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Get current user to verify permissions
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Allow users to view their own progress, or admins/teachers to view any student
    const canViewProgress = 
      user.id === studentIdNum || 
      user.role === 'super_admin' || 
      user.role === 'teacher' || 
      user.role === 'content_creator' ||
      user.role === 'parent';

    if (!canViewProgress) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot view this student\'s progress' },
        { status: 403 }
      );
    }

    const progressData = await getStudentProgress(studentIdNum);
    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student progress' },
      { status: 500 }
    );
  }
}