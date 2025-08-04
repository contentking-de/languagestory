import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { games, lessons, courses } from '@/lib/db/content-schema';
import { eq, desc } from 'drizzle-orm';
import { logGameActivityServer } from '@/lib/activity-logger-server';
import { getUserWithTeamData } from '@/lib/db/queries';

// GET: Fetch all games from database
export async function GET() {
  try {
    const allGames = await db
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
      .where(eq(games.is_active, true))
      .orderBy(desc(games.created_at));

    return NextResponse.json(allGames);
  } catch (error) {
    console.error('Error fetching games from database:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

// POST: Create a new custom game
export async function POST(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user || (user.role !== 'super_admin' && user.role !== 'content_creator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      tags
    } = body;

    // Validate required fields
    if (!title || !game_type) {
      return NextResponse.json(
        { error: 'Title and game type are required' },
        { status: 400 }
      );
    }

    // Create the new game
    const [newGame] = await db
      .insert(games)
      .values({
        title,
        description: description || '',
        game_type,
        language: language || null,
        category: category || 'general',
        difficulty_level: difficulty_level || 1,
        estimated_duration: estimated_duration || 5,
        lesson_id: lesson_id ? parseInt(lesson_id) : null,
        game_config: game_config || null,
        tags: tags || null,
        provider_name: 'Custom',
        added_by: user.id,
        is_active: true,
        is_featured: false,
        usage_count: 0,
      })
      .returning();

    // Log the activity
    await logGameActivityServer(
      user.teamId,
      user.id,
      'CREATE_GAME',
      newGame.id
    );

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game', details: error },
      { status: 500 }
    );
  }
}

// DELETE: Delete a game
export async function DELETE(request: Request) {
  try {
    const user = await getUserWithTeamData();
    if (!user || (user.role !== 'super_admin' && user.role !== 'content_creator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      );
    }

    // Check if game exists and user has permission to delete it
    const [existingGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!existingGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Only super_admin can delete any game, content_creator can only delete their own games
    if (user.role !== 'super_admin' && existingGame.added_by !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete games you created' },
        { status: 403 }
      );
    }

    // Delete the game
    await db.delete(games).where(eq(games.id, gameId));

    return NextResponse.json({ 
      success: true, 
      message: 'Game deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    );
  }
} 