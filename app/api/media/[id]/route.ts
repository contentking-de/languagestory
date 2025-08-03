import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { media_files } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // Get file info from database first
    const file = await db
      .select()
      .from(media_files)
      .where(eq(media_files.id, parseInt(id)))
      .limit(1);

    if (file.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from Vercel Blob
    await del(file[0].blob_id);

    // Delete from database
    await db
      .delete(media_files)
      .where(eq(media_files.id, parseInt(id)));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
} 