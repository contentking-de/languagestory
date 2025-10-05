import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { tickets, users } from '@/lib/db/schema';
import { eq, desc, asc, like, and, or, sql } from 'drizzle-orm';

// GET - Fetch all tickets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const ticketType = searchParams.get('type');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build base where conditions (EXCLUDING status so we can compute counts across all statuses)
    const baseWhereConditions = [] as any[];
    if (priority) {
      baseWhereConditions.push(eq(tickets.priority, priority));
    }
    if (ticketType) {
      baseWhereConditions.push(eq(tickets.ticketType, ticketType));
    }
    if (assignedTo) {
      baseWhereConditions.push(eq(tickets.assignedTo, parseInt(assignedTo)));
    }
    if (search) {
      baseWhereConditions.push(
        or(
          like(tickets.title, `%${search}%`),
          like(tickets.description, `%${search}%`),
          like(tickets.tags, `%${search}%`)
        )
      );
    }

    // Full where conditions used for the ticket list (includes status if provided)
    const listWhereConditions = [
      ...baseWhereConditions,
      ...(status ? [eq(tickets.status, status)] : []),
    ] as any[];

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'title':
        orderBy = sortOrder === 'asc' ? asc(tickets.title) : desc(tickets.title);
        break;
      case 'priority':
        orderBy = sortOrder === 'asc' ? asc(tickets.priority) : desc(tickets.priority);
        break;
      case 'status':
        orderBy = sortOrder === 'asc' ? asc(tickets.status) : desc(tickets.status);
        break;
      case 'dueDate':
        orderBy = sortOrder === 'asc' ? asc(tickets.dueDate) : desc(tickets.dueDate);
        break;
      case 'updatedAt':
        orderBy = sortOrder === 'asc' ? asc(tickets.updatedAt) : desc(tickets.updatedAt);
        break;
      default:
        orderBy = sortOrder === 'asc' ? asc(tickets.createdAt) : desc(tickets.createdAt);
    }

    // Fetch tickets with user information
    const ticketsData = await db
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
      .where(listWhereConditions.length > 0 ? and(...listWhereConditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Fetch assigned user information separately
    const ticketsWithAssignedUsers = await Promise.all(
      ticketsData.map(async (ticket) => {
        if (ticket.assignedTo) {
          const [assignedUser] = await db
            .select({
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(eq(users.id, ticket.assignedTo))
            .limit(1);
          
          return {
            ...ticket,
            assignedToName: assignedUser?.name,
            assignedToEmail: assignedUser?.email,
          };
        }
        return {
          ...ticket,
          assignedToName: null,
          assignedToEmail: null,
        };
      })
    );

    // Get total count for pagination (respect status if provided, otherwise count all statuses)
    const [{ totalCount }] = await db
      .select({ totalCount: sql<number>`count(*)` })
      .from(tickets)
      .where(listWhereConditions.length > 0 ? and(...listWhereConditions) : undefined);

    // Compute precise status counts across ALL statuses (ignore status filter, respect other filters only)
    const [countsRow] = await db
      .select({
        total: sql<number>`count(*)`,
        open: sql<number>`coalesce(sum(case when ${tickets.status} = 'open' then 1 else 0 end), 0)`,
        in_progress: sql<number>`coalesce(sum(case when ${tickets.status} = 'in_progress' then 1 else 0 end), 0)`,
        resolved: sql<number>`coalesce(sum(case when ${tickets.status} = 'resolved' then 1 else 0 end), 0)`,
        closed: sql<number>`coalesce(sum(case when ${tickets.status} = 'closed' then 1 else 0 end), 0)`,
      })
      .from(tickets)
      .where(baseWhereConditions.length > 0 ? and(...baseWhereConditions) : undefined);

    return NextResponse.json({
      tickets: ticketsWithAssignedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      statusCounts: countsRow,
    });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      ticketType,
      priority = 'medium',
      assignedTo,
      dueDate,
      tags,
      attachments,
    } = body;

    if (!title || !description || !ticketType) {
      return NextResponse.json(
        { error: 'Title, description, and ticket type are required' },
        { status: 400 }
      );
    }

    // Validate ticket type
    const validTypes = ['bug', 'tech_support', 'feature_request'];
    if (!validTypes.includes(ticketType)) {
      return NextResponse.json(
        { error: 'Invalid ticket type' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    const newTicket = await db
      .insert(tickets)
      .values({
        title,
        description,
        ticketType,
        priority,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags ? tags.join(',') : null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      ticket: newTicket[0],
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
} 