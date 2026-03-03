import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { invitations, users, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Public route to get invitation details for sign-up form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invitationId = parseInt(id);

    if (isNaN(invitationId)) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      );
    }

    const [invitation] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        invitedAt: invitations.invitedAt,
        invitedByName: users.name,
        teamId: invitations.teamId,
      })
      .from(invitations)
      .leftJoin(users, eq(invitations.invitedBy, users.id))
      .where(eq(invitations.id, invitationId))
      .limit(1);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if invitation has expired (7 days)
    const invitationDate = new Date(invitation.invitedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - invitationDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      return NextResponse.json(
        { error: 'Invitation expired', expired: true },
        { status: 400 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation already used', used: true },
        { status: 400 }
      );
    }

    const [team] = await db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, invitation.teamId))
      .limit(1);

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      invitedByName: invitation.invitedByName || 'Your teacher',
      teamName: team?.name || 'Lingoletics.com',
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}
