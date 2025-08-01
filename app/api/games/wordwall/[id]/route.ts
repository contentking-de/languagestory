import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { games, lessons, courses } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';

// GET: Fetch a single game by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const [game] = await db
      .select({
        id: games.id,
        title: games.title,
        description: games.description,
        original_url: games.original_url,
        normalized_url: games.normalized_url,
        embed_html: games.embed_html,
        thumbnail_url: games.thumbnail_url,
        author_name: games.author_name,
        author_url: games.author_url,
        provider_name: games.provider_name,
        provider_url: games.provider_url,
        width: games.width,
        height: games.height,
        category: games.category,
        language: games.language,
        difficulty_level: games.difficulty_level,
        estimated_duration: games.estimated_duration,
        lesson_id: games.lesson_id,
        lesson_title: lessons.title,
        course_title: courses.title,
        course_language: courses.language,
        tags: games.tags,
        is_active: games.is_active,
        is_featured: games.is_featured,
        added_by: games.added_by,
        usage_count: games.usage_count,
        created_at: games.created_at,
        updated_at: games.updated_at,
      })
      .from(games)
      .leftJoin(lessons, eq(games.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(games.id, gameId))
      .limit(1);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a game from the database
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_active to false
    const [deletedGame] = await db
      .update(games)
      .set({ 
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(games.id, gameId))
      .returning();

    if (!deletedGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Game deleted successfully',
      game: deletedGame 
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}

// PATCH: Update a game (e.g., increment usage count, toggle featured status)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { increment_usage, is_featured, difficulty_level, tags, language, lesson_id } = body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (increment_usage) {
      // Increment usage count
      const [currentGame] = await db
        .select({ usage_count: games.usage_count })
        .from(games)
        .where(eq(games.id, gameId))
        .limit(1);
      
      if (currentGame) {
        updateData.usage_count = (currentGame.usage_count || 0) + 1;
      }
    }

    if (typeof is_featured === 'boolean') {
      updateData.is_featured = is_featured;
    }

    if (typeof difficulty_level === 'number') {
      updateData.difficulty_level = difficulty_level;
    }

    if (Array.isArray(tags)) {
      updateData.tags = tags;
    }

    if (typeof language === 'string') {
      updateData.language = language;
    }

    if (typeof lesson_id === 'number' || lesson_id === null) {
      updateData.lesson_id = lesson_id;
    }

    const [updatedGame] = await db
      .update(games)
      .set(updateData)
      .where(eq(games.id, gameId))
      .returning();

    if (!updatedGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

// PUT: Full update of a game
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      language,
      difficulty_level,
      estimated_duration,
      lesson_id,
      tags,
      is_featured
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      title: title.trim(),
      description: description?.trim() || '',
      category,
      language: language || null,
      difficulty_level: difficulty_level || 1,
      estimated_duration,
      lesson_id: lesson_id || null,
      tags: tags || [],
      is_featured: is_featured || false,
      updated_at: new Date()
    };

    const [updatedGame] = await db
      .update(games)
      .set(updateData)
      .where(eq(games.id, gameId))
      .returning();

    if (!updatedGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Fetch the updated game with lesson/course info
    const [gameWithRelations] = await db
      .select({
        id: games.id,
        title: games.title,
        description: games.description,
        original_url: games.original_url,
        normalized_url: games.normalized_url,
        embed_html: games.embed_html,
        thumbnail_url: games.thumbnail_url,
        author_name: games.author_name,
        author_url: games.author_url,
        provider_name: games.provider_name,
        provider_url: games.provider_url,
        width: games.width,
        height: games.height,
        category: games.category,
        language: games.language,
        difficulty_level: games.difficulty_level,
        estimated_duration: games.estimated_duration,
        lesson_id: games.lesson_id,
        lesson_title: lessons.title,
        course_title: courses.title,
        course_language: courses.language,
        tags: games.tags,
        is_active: games.is_active,
        is_featured: games.is_featured,
        added_by: games.added_by,
        usage_count: games.usage_count,
        created_at: games.created_at,
        updated_at: games.updated_at,
      })
      .from(games)
      .leftJoin(lessons, eq(games.lesson_id, lessons.id))
      .leftJoin(courses, eq(lessons.course_id, courses.id))
      .where(eq(games.id, gameId))
      .limit(1);

    return NextResponse.json(gameWithRelations);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
} 