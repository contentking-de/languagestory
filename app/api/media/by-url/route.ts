import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { media_files } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const urls = searchParams.get('urls');

    if (!urls) {
      return NextResponse.json({ error: 'URLs parameter required' }, { status: 400 });
    }

    const urlList = urls.split(',').map(url => url.trim()).filter(url => url);

    if (urlList.length === 0) {
      return NextResponse.json({ files: [] });
    }

    // Fetch files by URLs
    const files = await db
      .select()
      .from(media_files)
      .where(urlList.map(url => eq(media_files.url, url)).reduce((acc, condition) => acc || condition));

    return NextResponse.json({ files });

  } catch (error) {
    console.error('Error fetching media files by URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
} 