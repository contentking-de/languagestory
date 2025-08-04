import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { tickets, users, ticketComments, ticketHistory } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Fetch a specific ticket with comments and history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // Fetch ticket with user information
    const [ticket] = await db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        ticketType: tickets.ticketType,
        priority: tickets.priority,
        status: tickets.status,
        assignedTo: tickets.assignedTo,
        createdBy: tickets.createdBy,
        updatedBy: tickets.updatedBy,
        dueDate: tickets.dueDate,
        resolutionNotes: tickets.resolutionNotes,
        tags: tickets.tags,
        attachments: tickets.attachments,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        resolvedAt: tickets.resolvedAt,
        // User information
        createdByName: users.name,
        createdByEmail: users.email,
      })
      .from(tickets)
      .leftJoin(users, eq(tickets.createdBy, users.id))
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Fetch assigned user information separately
    let assignedToName = null;
    let assignedToEmail = null;
    if (ticket.assignedTo) {
      const [assignedUser] = await db
        .select({
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, ticket.assignedTo))
        .limit(1);
      
      assignedToName = assignedUser?.name;
      assignedToEmail = assignedUser?.email;
    }

    const ticketWithAssignedUser = {
      ...ticket,
      assignedToName,
      assignedToEmail,
    };

    // Fetch comments
    const comments = await db
      .select({
        id: ticketComments.id,
        comment: ticketComments.comment,
        isInternal: ticketComments.isInternal,
        createdAt: ticketComments.createdAt,
        userId: ticketComments.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(ticketComments)
      .leftJoin(users, eq(ticketComments.userId, users.id))
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(desc(ticketComments.createdAt));

    // Fetch history
    const history = await db
      .select({
        id: ticketHistory.id,
        action: ticketHistory.action,
        fieldName: ticketHistory.fieldName,
        oldValue: ticketHistory.oldValue,
        newValue: ticketHistory.newValue,
        createdAt: ticketHistory.createdAt,
        userId: ticketHistory.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(ticketHistory)
      .leftJoin(users, eq(ticketHistory.userId, users.id))
      .where(eq(ticketHistory.ticketId, ticketId))
      .orderBy(desc(ticketHistory.createdAt));

    return NextResponse.json({
      ticket: ticketWithAssignedUser,
      comments,
      history,
    });

  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// PUT - Update a ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      ticketType,
      priority,
      status,
      assignedTo,
      dueDate,
      resolutionNotes,
      tags,
      attachments,
    } = body;

    // Get current ticket to track changes
    const [currentTicket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!currentTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedBy: user.id,
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (ticketType !== undefined) updateData.ticketType = ticketType;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo ? parseInt(assignedTo) : null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;
    if (tags !== undefined) updateData.tags = tags ? tags.join(',') : null;
    if (attachments !== undefined) updateData.attachments = attachments ? JSON.stringify(attachments) : null;

    // Set resolvedAt if status is resolved
    if (status === 'resolved' && currentTicket.status !== 'resolved') {
      updateData.resolvedAt = new Date();
    }

    // Update ticket
    const [updatedTicket] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, ticketId))
      .returning();

    // Track changes in history
    const historyEntries = [];
    for (const [field, newValue] of Object.entries(updateData)) {
      if (field !== 'updatedBy' && field !== 'updatedAt' && field !== 'resolvedAt') {
        const oldValue = currentTicket[field as keyof typeof currentTicket];
        if (oldValue !== newValue) {
          historyEntries.push({
            ticketId,
            userId: user.id,
            action: 'updated',
            fieldName: field,
            oldValue: oldValue?.toString() || null,
            newValue: newValue?.toString() || null,
          });
        }
      }
    }

    if (historyEntries.length > 0) {
      await db.insert(ticketHistory).values(historyEntries);
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });

  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Delete related records first
    await db.delete(ticketComments).where(eq(ticketComments.ticketId, ticketId));
    await db.delete(ticketHistory).where(eq(ticketHistory.ticketId, ticketId));
    
    // Delete the ticket
    await db.delete(tickets).where(eq(tickets.id, ticketId));

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
} 