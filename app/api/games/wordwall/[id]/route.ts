import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { games } from '@/lib/db/content-schema';
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
      .select()
      .from(games)
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
    const { increment_usage, is_featured, difficulty_level, tags, language } = body;

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