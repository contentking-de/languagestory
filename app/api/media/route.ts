import { NextRequest, NextResponse } from 'next/server';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { media_files } from '@/lib/db/content-schema';
import { eq, like, desc } from 'drizzle-orm';

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
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = [];
    
    if (search) {
      conditions.push(like(media_files.name, `%${search}%`));
    }
    
    if (category && category !== 'all') {
      conditions.push(eq(media_files.category, category));
    }

    // Fetch files with pagination
    const files = await db
      .select()
      .from(media_files)
      .where(conditions.length > 0 ? conditions.reduce((acc, condition) => acc && condition) : undefined)
      .orderBy(desc(media_files.uploaded_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: media_files.id })
      .from(media_files)
      .where(conditions.length > 0 ? conditions.reduce((acc, condition) => acc && condition) : undefined);

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
} 