import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db/drizzle';
import { outreachContacts, outreachEmails } from '@/lib/db/schema';
import { getUserWithTeamData } from '@/lib/db/queries';
import { inArray } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactIds, subject, body: emailBody } = body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: 'No contacts selected' }, { status: 400 });
    }

    if (!subject || !emailBody) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const contacts = await db
      .select()
      .from(outreachContacts)
      .where(inArray(outreachContacts.id, contactIds));

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Lingoletics.com <info@lingoletics.com>',
          to: [contact.email],
          subject,
          html: wrapEmailHtml(emailBody, contact),
        });

        if (error) {
          failed++;
          errors.push(`${contact.email}: ${error.message}`);

          await db.insert(outreachEmails).values({
            contactId: contact.id,
            subject,
            body: emailBody,
            status: 'failed',
            sentBy: user.id,
            errorMessage: error.message,
          });
        } else {
          sent++;

          await db.insert(outreachEmails).values({
            contactId: contact.id,
            subject,
            body: emailBody,
            status: 'sent',
            sentAt: new Date(),
            sentBy: user.id,
            resendId: data?.id || null,
          });
        }
      } catch (err: any) {
        failed++;
        const message = err?.message || 'Unknown error';
        errors.push(`${contact.email}: ${message}`);

        await db.insert(outreachEmails).values({
          contactId: contact.id,
          subject,
          body: emailBody,
          status: 'failed',
          sentBy: user.id,
          errorMessage: message,
        });
      }
    }

    return NextResponse.json({ sent, failed, errors });
  } catch (error) {
    console.error('Error sending outreach emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}

function wrapEmailHtml(body: string, contact: { name: string | null; email: string }): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 24px 30px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Lingoletics.com</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        ${body}
      </div>
      <div style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
          Lingoletics.com | 30 Tithe Barn Road, Stafford, England, ST16 3PH, GB
        </p>
      </div>
    </div>
  `;
}
