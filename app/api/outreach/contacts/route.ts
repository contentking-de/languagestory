import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { outreachContacts, outreachEmails } from '@/lib/db/schema';
import { getUserWithTeamData } from '@/lib/db/queries';
import { eq, inArray, desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactsData = await db
      .select({
        id: outreachContacts.id,
        email: outreachContacts.email,
        name: outreachContacts.name,
        school: outreachContacts.school,
        notes: outreachContacts.notes,
        source: outreachContacts.source,
        createdAt: outreachContacts.createdAt,
        lastEmailStatus: sql<string | null>`(
          SELECT ${outreachEmails.status} FROM ${outreachEmails}
          WHERE ${outreachEmails.contactId} = ${outreachContacts.id}
          ORDER BY ${outreachEmails.createdAt} DESC LIMIT 1
        )`,
        lastEmailDate: sql<string | null>`(
          SELECT ${outreachEmails.sentAt} FROM ${outreachEmails}
          WHERE ${outreachEmails.contactId} = ${outreachContacts.id}
          ORDER BY ${outreachEmails.createdAt} DESC LIMIT 1
        )`,
      })
      .from(outreachContacts)
      .orderBy(desc(outreachContacts.createdAt));

    return NextResponse.json(contactsData);
  } catch (error) {
    console.error('Error fetching outreach contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, school, notes } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existing = await db
      .select({ id: outreachContacts.id })
      .from(outreachContacts)
      .where(eq(outreachContacts.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'A contact with this email already exists' }, { status: 409 });
    }

    const [newContact] = await db
      .insert(outreachContacts)
      .values({
        email: email.toLowerCase().trim(),
        name: name || null,
        school: school || null,
        notes: notes || null,
        source: 'manual',
      })
      .returning();

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('Error creating outreach contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs are required' }, { status: 400 });
    }

    await db.delete(outreachEmails).where(inArray(outreachEmails.contactId, ids));
    await db.delete(outreachContacts).where(inArray(outreachContacts.id, ids));

    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    console.error('Error deleting outreach contacts:', error);
    return NextResponse.json({ error: 'Failed to delete contacts' }, { status: 500 });
  }
}
