import { NextResponse } from 'next/server';
import { awardPoints } from '@/lib/gamification';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    // Single auth check for the entire batch
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { activities } = await request.json();

    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { error: 'Activities array is required' },
        { status: 400 }
      );
    }

    let totalPointsAwarded = 0;
    const results: Array<{ activity_type: string; points_awarded: number }> = [];

    // Process activities sequentially to avoid race conditions on shared state
    // (learning_streaks, daily_activity, achievements)
    for (const activity of activities) {
      const { activity_type, reference_id, reference_type, language, metadata } = activity;

      if (!activity_type) {
        results.push({ activity_type: 'unknown', points_awarded: 0 });
        continue;
      }

      try {
        const pointsAwarded = await awardPoints(
          user.id,
          activity_type,
          reference_id,
          reference_type,
          language,
          metadata
        );
        totalPointsAwarded += pointsAwarded;
        results.push({ activity_type, points_awarded: pointsAwarded });
      } catch (error) {
        console.error(`Error awarding points for ${activity_type}:`, error);
        results.push({ activity_type, points_awarded: 0 });
      }
    }

    return NextResponse.json({
      success: true,
      total_points_awarded: totalPointsAwarded,
      results,
    });
  } catch (error) {
    console.error('Error in batch award points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}
