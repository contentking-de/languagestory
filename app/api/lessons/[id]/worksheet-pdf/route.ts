import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { getUserWithTeamData } from '@/lib/db/queries';
import { canAccessTeacherResources } from '@/lib/auth/rbac';
import { db } from '@/lib/db/drizzle';
import { lessons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { loadWorksheetData } from '@/lib/worksheet/load-worksheet-data';
import { WorksheetDocument } from '@/lib/worksheet/WorksheetDocument';
import { getWorksheetLogoDataUri, getWorksheetHeaderIconDataUri } from '@/lib/worksheet/worksheet-logo';

function safeFilenamePart(s: string, max = 72): string {
  const t = s.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return (t || 'lesson').slice(0, max);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || !canAccessTeacherResources({ role: user.role, userRole: user.userRole })) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const lessonId = parseInt(id, 10);
    if (Number.isNaN(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    const [lessonRow] = await db
      .select({ is_published: lessons.is_published, slug: lessons.slug })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!lessonRow) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (!lessonRow.is_published) {
      return NextResponse.json({ error: 'Lesson not available' }, { status: 403 });
    }

    const data = await loadWorksheetData(lessonId);
    if (!data) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const logoSrc = getWorksheetLogoDataUri();
    const worksheetIconSrc = getWorksheetHeaderIconDataUri();
    const buffer = await renderToBuffer(
      createElement(WorksheetDocument, {
        data,
        logoSrc,
        worksheetIconSrc,
      }) as Parameters<typeof renderToBuffer>[0]
    );
    const name = `worksheet_${lessonId}_${safeFilenamePart(lessonRow.slug)}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    console.error('worksheet-pdf:', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
