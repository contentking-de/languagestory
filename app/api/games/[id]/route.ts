import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { games, lessons, courses } from '@/lib/db/content-schema';
import { eq } from 'drizzle-orm';
import { getUserWithTeamData } from '@/lib/db/queries';

// GET: Fetch a specific game by ID
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

    const game = await db
      .select({
        id: games.id,
        title: games.title,
        description: games.description,
        game_type: games.game_type,
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
        game_config: games.game_config,
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

    if (!game || game.length === 0) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('API: Game found:', game[0].id, game[0].title);
    console.log('API: Game type:', game[0].game_type);
    console.log('API: Game config type:', typeof game[0].game_config);
    console.log('API: Game config value:', game[0].game_config);

    return NextResponse.json(game[0]);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// PUT: Update a game
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || (user.role !== 'super_admin' && user.role !== 'content_creator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      game_type,
      language,
      category,
      difficulty_level,
      estimated_duration,
      lesson_id,
      game_config,
      tags,
      is_active,
      is_featured
    } = body;

    // Check if game exists and user has permission to edit
    const existingGame = await db
      .select({ added_by: games.added_by })
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!existingGame || existingGame.length === 0) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Only super_admin or the creator can edit
    if (user.role !== 'super_admin' && existingGame[0].added_by !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this game' },
        { status: 403 }
      );
    }

    // Update the game
    await db
      .update(games)
      .set({
        title: title || undefined,
        description: description || undefined,
        game_type: game_type || undefined,
        language: language || undefined,
        category: category || undefined,
        difficulty_level: difficulty_level || undefined,
        estimated_duration: estimated_duration || undefined,
        lesson_id: lesson_id || undefined,
        game_config: game_config || undefined,
        tags: tags || undefined,
        is_active: is_active !== undefined ? is_active : undefined,
        is_featured: is_featured !== undefined ? is_featured : undefined,
        updated_at: new Date(),
      })
      .where(eq(games.id, gameId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a game
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithTeamData();
    if (!user || (user.role !== 'super_admin' && user.role !== 'content_creator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const gameId = parseInt(id);

    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    // Check if game exists and user has permission to delete
    const existingGame = await db
      .select({ added_by: games.added_by })
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!existingGame || existingGame.length === 0) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Only super_admin or the creator can delete
    if (user.role !== 'super_admin' && existingGame[0].added_by !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this game' },
        { status: 403 }
      );
    }

    // Delete the game
    await db
      .delete(games)
      .where(eq(games.id, gameId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
} 