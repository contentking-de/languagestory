import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { games } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lessonId = parseInt(id);

    if (isNaN(lessonId)) {
      return NextResponse.json(
        { error: 'Invalid lesson ID' },
        { status: 400 }
      );
    }

    const gamesData = await db
      .select({
        id: games.id,
        title: games.title,
        description: games.description,
        category: games.category,
        language: games.language,
        difficulty_level: games.difficulty_level,
        estimated_duration: games.estimated_duration,
        thumbnail_url: games.thumbnail_url,
        is_active: games.is_active,
        is_featured: games.is_featured,
        usage_count: games.usage_count,
        created_at: games.created_at,
      })
      .from(games)
      .where(eq(games.lesson_id, lessonId))
      .orderBy(games.created_at);

    return NextResponse.json(gamesData);
  } catch (error) {
    console.error('Error fetching lesson games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson games' },
      { status: 500 }
    );
  }
} 