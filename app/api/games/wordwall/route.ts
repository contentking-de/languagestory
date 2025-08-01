import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { games, lessons, courses } from '@/lib/db/content-schema';
import { eq, desc } from 'drizzle-orm';
import { logGameActivityServer } from '@/lib/activity-logger-server';

// Helper function to determine game category from title and content
function categorizeGame(title: string, authorName: string): string {
  const text = `${title} ${authorName}`.toLowerCase();
  
  if (text.includes('french') || text.includes('français')) return 'french';
  if (text.includes('german') || text.includes('deutsch')) return 'german';
  if (text.includes('spanish') || text.includes('español')) return 'spanish';
  if (text.includes('english')) return 'english';
  if (text.includes('math') || text.includes('number') || text.includes('counting')) return 'math';
  if (text.includes('science') || text.includes('chemistry') || text.includes('biology')) return 'science';
  if (text.includes('history') || text.includes('historical')) return 'history';
  if (text.includes('geography') || text.includes('countries') || text.includes('world')) return 'geography';
  if (text.includes('vocabulary') || text.includes('words')) return 'vocabulary';
  if (text.includes('grammar')) return 'grammar';
  if (text.includes('quiz') || text.includes('test')) return 'quiz';
  if (text.includes('match') || text.includes('pair')) return 'matching';
  
  return 'general';
}

// GET: Fetch all games from database
export async function GET() {
  try {
    const allGames = await db
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

// POST: Add a new game or fetch games from Wordwall and save to database
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const singleUrl = searchParams.get('url');
    
    // Handle single game addition via query parameter
    if (singleUrl) {
      return await handleSingleGame(singleUrl, request);
    }
    
    // Handle batch game addition via request body
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'URLs array is required for batch processing' },
        { status: 400 }
      );
    }

    return await handleBatchGames(urls, request);
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Handle single game addition
async function handleSingleGame(wordwallUrl: string, request: Request) {
  try {
    console.log('Received URL parameter:', wordwallUrl);

    if (!wordwallUrl) {
      return NextResponse.json(
        { error: 'Wordwall URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (wordwallUrl.includes('Error') || wordwallUrl.includes('error')) {
      return NextResponse.json(
        { error: 'Invalid URL format received' },
        { status: 400 }
      );
    }

    if (!wordwallUrl.includes('wordwall.net') || !wordwallUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid Wordwall URL. Must be a valid HTTP URL from wordwall.net' },
        { status: 400 }
      );
    }

    // Check if game already exists in database
    const normalizedUrl = normalizeWordwallUrl(wordwallUrl);
    const existingGame = await db
      .select()
      .from(games)
      .where(eq(games.normalized_url, normalizedUrl))
      .limit(1);

    if (existingGame.length > 0) {
      return NextResponse.json(
        { 
          error: 'Game already exists in database',
          existingGame: existingGame[0]
        },
        { status: 409 }
      );
    }

    // Fetch from Wordwall API
    const gameData = await fetchFromWordwall(normalizedUrl);
    if (!gameData) {
      return NextResponse.json(
        { error: 'Failed to fetch game from Wordwall' },
        { status: 404 }
      );
    }

    // Save to database
    const savedGame = await saveGameToDatabase(gameData, wordwallUrl, normalizedUrl, 1); // TODO: Get actual user ID

    return NextResponse.json(savedGame, { status: 201 });
  } catch (error) {
    console.error('Error handling single game:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add game';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle batch game addition
async function handleBatchGames(urls: string[], request: Request) {
  try {
    const gamePromises = urls.map(async (url: string) => {
      try {
        if (!url.includes('wordwall.net')) {
          throw new Error('Invalid Wordwall URL');
        }

        const normalizedUrl = normalizeWordwallUrl(url);
        
        // Check if already exists
        const existingGame = await db
          .select()
          .from(games)
          .where(eq(games.normalized_url, normalizedUrl))
          .limit(1);

        if (existingGame.length > 0) {
          return { 
            original_url: url, 
            success: true, 
            existing: true,
            game: existingGame[0]
          };
        }

        // Fetch from Wordwall
        const gameData = await fetchFromWordwall(normalizedUrl);
        if (!gameData) {
          throw new Error('Failed to fetch from Wordwall API');
        }

        // Save to database
        const savedGame = await saveGameToDatabase(gameData, url, normalizedUrl, 1); // TODO: Get actual user ID
        
        return { 
          original_url: url, 
          success: true, 
          existing: false,
          game: savedGame
        };
      } catch (error) {
        return { 
          original_url: url, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const results = await Promise.all(gamePromises);
    return NextResponse.json({ games: results });
  } catch (error) {
    console.error('Error processing batch games:', error);
    return NextResponse.json(
      { error: 'Failed to process games' },
      { status: 500 }
    );
  }
}

// Helper function to normalize Wordwall URLs
function normalizeWordwallUrl(url: string): string {
  const resourceMatch = url.match(/https:\/\/wordwall\.net\/(resource|play)\/(\d+)/);
  if (resourceMatch) {
    const [, type, id] = resourceMatch;
    return `https://wordwall.net/${type}/${id}`;
  }
  return url;
}

// Helper function to fetch game data from Wordwall API
async function fetchFromWordwall(normalizedUrl: string) {
  try {
    const oembedUrl = `https://wordwall.net/api/oembed?url=${encodeURIComponent(normalizedUrl)}&format=json`;
    console.log('Fetching Wordwall game:', normalizedUrl);
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LanguageStory/1.0)',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Game not found. The URL "${normalizedUrl}" may not exist or may not be publicly available.`);
      }
      throw new Error(`Wordwall API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Wordwall:', error);
    throw error;
  }
}

// Helper function to save game data to database
async function saveGameToDatabase(gameData: any, originalUrl: string, normalizedUrl: string, userId: number) {
  try {
    const category = categorizeGame(gameData.title || '', gameData.author_name || '');
    
    const newGame = {
      title: gameData.title || 'Untitled Game',
      description: `A ${gameData.type || 'game'} by ${gameData.author_name || 'Unknown'}`,
      original_url: originalUrl,
      normalized_url: normalizedUrl,
      embed_html: gameData.html || '',
      thumbnail_url: gameData.thumbnail_url || null,
      author_name: gameData.author_name || null,
      author_url: gameData.author_url || null,
      provider_name: gameData.provider_name || 'Wordwall',
      provider_url: gameData.provider_url || 'https://wordwall.net',
      width: gameData.width || null,
      height: gameData.height || null,
      category: category as any,
      language: null, // TODO: Detect language from content
      difficulty_level: 1, // TODO: Analyze and determine difficulty
      estimated_duration: null, // TODO: Estimate based on game type
      tags: [], // TODO: Extract tags from title/content
      is_active: true,
      is_featured: false,
      added_by: userId,
      usage_count: 0,
    };

    const [savedGame] = await db
      .insert(games)
      .values(newGame)
      .returning();

    // Log the activity after successful game creation
    await logGameActivityServer('CREATE_GAME');

    return savedGame;
  } catch (error) {
    console.error('Error saving game to database:', error);
    throw error;
  }
} 