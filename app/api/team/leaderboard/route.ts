import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teamMembers, users, learning_streaks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getStudentProgress } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserWithTeamData();
    
    if (!user?.teamId) {
      return NextResponse.json(
        { error: 'User not found or not part of a team' },
        { status: 401 }
      );
    }

    // Get all students from the same team (including current user if they are a student)
    const teamStudents = await db
      .select({
        userId: teamMembers.userId,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(
        and(
          eq(teamMembers.teamId, user.teamId),
          eq(teamMembers.role, 'student')
        )
      )
      .orderBy(users.name);

    // Get progress data for each student
    const leaderboard = await Promise.all(
      teamStudents.map(async (student) => {
        try {
          const progress = await getStudentProgress(student.userId);
          return {
            userId: student.userId,
            name: student.user.name || student.user.email,
            email: student.user.email,
            totalPoints: progress.streak?.total_points || 0,
            currentStreak: progress.streak?.current_streak || 0,
            longestStreak: progress.streak?.longest_streak || 0,
          };
        } catch (error) {
          console.error(`Error fetching progress for student ${student.userId}:`, error);
          return {
            userId: student.userId,
            name: student.user.name || student.user.email,
            email: student.user.email,
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
          };
        }
      })
    );

    // Sort by total points (descending), then by current streak
    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.currentStreak - a.currentStreak;
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
