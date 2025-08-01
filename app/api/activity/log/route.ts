import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { activityLogs, type NewActivityLog, teams, teamMembers, type NewTeam, type NewTeamMember } from '@/lib/db/schema';
import { ActivityType } from '@/lib/db/schema';
import { getUserWithTeamData } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const { activityType, ipAddress } = await request.json();
    console.log(`📝 Activity log API called with type: ${activityType}, IP: ${ipAddress}`);

    if (!activityType || !Object.values(ActivityType).includes(activityType)) {
      console.error(`❌ Invalid activity type: ${activityType}`);
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    const user = await getUserWithTeamData();
    if (!user) {
      console.error(`❌ No user found`);
      return NextResponse.json(
        { error: 'No user found' },
        { status: 401 }
      );
    }

    console.log(`👤 User found: ${user.id}, team: ${user.teamId}`);

    // Get user's team ID (required for activity logging)
    let teamId = user.teamId;
    if (!teamId) {
      console.log(`🔧 No team found for user ${user.id}, creating default team...`);
      
      // Create a default team for this user
      const newTeam: NewTeam = {
        name: `${user.name || user.email}'s Team`,
        subscriptionType: 'individual',
        planName: 'free',
        subscriptionStatus: 'trialing',
        stripeCustomerId: null,
        stripeSubscriptionId: null
      };

      const [createdTeam] = await db.insert(teams).values(newTeam).returning();
      teamId = createdTeam.id;

      // Add user to the team
      const newTeamMember: NewTeamMember = {
        teamId,
        userId: user.id,
        role: 'owner', // Make them the owner of their default team
      };

      await db.insert(teamMembers).values(newTeamMember);
      console.log(`✅ Created default team ${teamId} for user ${user.id}`);
    }

    const newActivity: NewActivityLog = {
      teamId,
      userId: user.id,
      action: activityType,
      ipAddress: ipAddress || '',
      language: null, // Optional field
      metadata: null  // Optional field
    };

    await db.insert(activityLogs).values(newActivity);
    console.log(`✅ Activity successfully saved to database`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}