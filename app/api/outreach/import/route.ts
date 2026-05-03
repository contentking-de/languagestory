import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { outreachContacts } from '@/lib/db/schema';
import { getUserWithTeamData } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'The file contains no data' }, { status: 400 });
    }

    const emailKey = findColumnKey(Object.keys(rows[0]), ['email', 'e-mail', 'mail', 'emailaddress', 'e-mail-adresse', 'email_address']);
    if (!emailKey) {
      return NextResponse.json(
        { error: 'No email column found. Please name the column "email", "E-Mail" or "mail".' },
        { status: 400 }
      );
    }

    const nameKey = findColumnKey(Object.keys(rows[0]), ['name', 'fullname', 'full_name', 'full name', 'contact', 'kontakt']);
    const schoolKey = findColumnKey(Object.keys(rows[0]), ['school', 'schule', 'institution', 'organisation', 'organization']);
    const notesKey = findColumnKey(Object.keys(rows[0]), ['notes', 'notizen', 'bemerkung', 'kommentar', 'comment']);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const email = String(row[emailKey] || '').toLowerCase().trim();
      if (!email || !email.includes('@')) {
        skipped++;
        continue;
      }

      const existing = await db
        .select({ id: outreachContacts.id })
        .from(outreachContacts)
        .where(eq(outreachContacts.email, email))
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await db.insert(outreachContacts).values({
        email,
        name: nameKey ? String(row[nameKey] || '').trim() || null : null,
        school: schoolKey ? String(row[schoolKey] || '').trim() || null : null,
        notes: notesKey ? String(row[notesKey] || '').trim() || null : null,
        source: 'xlsx',
      });

      imported++;
    }

    return NextResponse.json({ imported, skipped, total: rows.length });
  } catch (error) {
    console.error('Error importing outreach contacts:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}

function findColumnKey(columns: string[], candidates: string[]): string | null {
  for (const col of columns) {
    const normalized = col.toLowerCase().replace(/[\s_-]/g, '');
    for (const candidate of candidates) {
      if (normalized === candidate.replace(/[\s_-]/g, '')) {
        return col;
      }
    }
  }
  return null;
}
