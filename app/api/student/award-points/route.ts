import { NextResponse } from 'next/server';
import { awardPoints } from '@/lib/gamification';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      activity_type, 
      reference_id, 
      reference_type, 
      language, 
      metadata 
    } = await request.json();

    if (!activity_type) {
      return NextResponse.json(
        { error: 'Activity type is required' },
        { status: 400 }
      );
    }

    // Award points to the current user
    const pointsAwarded = await awardPoints(
      user.id,
      activity_type,
      reference_id,
      reference_type,
      language,
      metadata
    );

    return NextResponse.json({ 
      success: true, 
      points_awarded: pointsAwarded,
      message: `Awarded ${pointsAwarded} points for ${activity_type}` 
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    );
  }
}