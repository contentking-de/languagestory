import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { invitations, users, teams } from '@/lib/db/schema';
import { getUserWithTeamData } from '@/lib/db/queries';
import { eq, desc, and } from 'drizzle-orm';
import { sendInvitationEmail } from '@/lib/email/invitation-email';

export async function GET() {
  try {
    const user = await getUserWithTeamData();

    if (!user?.teamId) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 401 });
    }

    // Fetch all invitations for the current team with inviter information
    const teamInvitations = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        language: invitations.language,
        status: invitations.status,
        invitedAt: invitations.invitedAt,
        inviterName: users.name,
        inviterEmail: users.email,
      })
      .from(invitations)
      .leftJoin(users, eq(invitations.invitedBy, users.id))
      .where(eq(invitations.teamId, user.teamId))
      .orderBy(desc(invitations.invitedAt));

    return NextResponse.json({ invitations: teamInvitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserWithTeamData();

    if (!user?.teamId) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 401 });
    }

    const { invitationId, action } = await request.json();

    if (!invitationId || !action) {
      return NextResponse.json({ error: 'Missing invitation ID or action' }, { status: 400 });
    }

    if (action === 'resend') {
      // Find the invitation
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.id, invitationId),
            eq(invitations.teamId, user.teamId)
          )
        )
        .limit(1);

      if (!invitation) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }

      if (invitation.status === 'accepted') {
        return NextResponse.json({ error: 'Cannot resend accepted invitation' }, { status: 400 });
      }

      // Get team name for the email
      const [team] = await db
        .select({ name: teams.name })
        .from(teams)
        .where(eq(teams.id, user.teamId))
        .limit(1);

      const teamName = team?.name || 'Lingoletics.com Team';

      // Update invitation timestamp and status
      await db
        .update(invitations)
        .set({ 
          invitedAt: new Date(),
          status: 'pending'
        })
        .where(eq(invitations.id, invitationId));

      // Resend invitation email
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.lingoletics.com');
      const invitationUrl = `${baseUrl}/sign-up?inviteId=${invitation.id}`;
      
      await sendInvitationEmail({
        email: invitation.email,
        role: invitation.role,
        invitedBy: user.name || user.email,
        teamName,
        invitationUrl
      });

      return NextResponse.json({ success: 'Invitation resent successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserWithTeamData();

    if (!user?.teamId) {
      return NextResponse.json({ error: 'User not found or not part of a team' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('id');

    if (!invitationId) {
      return NextResponse.json({ error: 'Missing invitation ID' }, { status: 400 });
    }

    // Check if invitation exists and belongs to the user's team
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(invitationId)),
          eq(invitations.teamId, user.teamId)
        )
      )
      .limit(1);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'Cannot cancel accepted invitation' }, { status: 400 });
    }

    // Delete the invitation
    await db
      .delete(invitations)
      .where(eq(invitations.id, parseInt(invitationId)));

    return NextResponse.json({ success: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}