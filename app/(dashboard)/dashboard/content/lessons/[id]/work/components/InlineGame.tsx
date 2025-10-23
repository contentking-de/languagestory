'use client';

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Trophy,
  CheckCircle,
  AlertCircle,
  Gamepad2,
  Play,
  RotateCcw
} from 'lucide-react';
import { 
  MemoryGame, 
  HangmanGame, 
  FlashcardsGame, 
  WordSearchGame, 
  WordMixupGame, 
  WordAssociationGame, 
  VocabRunGame 
} from '@/app/(dashboard)/dashboard/games/components/GameRenderers';

interface Game {
  id: number;
  title: string;
  description: string;
  category: string;
  game_type: string;
  game_config?: any;
  is_active: boolean;
  embed_html?: string;
  width?: number;
  height?: number;
  original_url?: string;
}

interface InlineGameProps {
  gameId: number;
  onComplete: (score: number, passed: boolean) => void;
  onNext: () => void;
}

interface WordwallIframeProps {
  embedHtml: string;
  width?: number;
  height?: number;
  onLoad: () => void;
  onError: () => void;
}

const WordwallIframe = memo(({ embedHtml, width, height, onLoad, onError }: WordwallIframeProps) => {
  const iframeRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  
  useEffect(() => {
    if (iframeRef.current && !isInitialized.current) {
      console.log('WordwallIframe: Initializing iframe');
      isInitialized.current = true;
      
      // Try to find iframe within the embedded content
      const iframe = iframeRef.current.querySelector('iframe');
      if (iframe) {
        console.log('WordwallIframe: Found iframe in embed content:', iframe);
        iframe.onload = () => {
          console.log('WordwallIframe: Iframe loaded successfully');
          onLoad();
        };
        iframe.onerror = () => {
          console.log('WordwallIframe: Iframe failed to load');
          onError();
        };
      } else {
        // If no iframe found, assume content loaded immediately
        console.log('WordwallIframe: No iframe found, assuming content loaded');
        setTimeout(() => onLoad(), 1000);
      }
    }
  }, [onLoad, onError]);

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: embedHtml }}
      className="w-full h-full"
      ref={iframeRef}
    />
  );
});

WordwallIframe.displayName = 'WordwallIframe';

export const InlineGame = memo(({ gameId, onComplete, onNext }: InlineGameProps) => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    fetchGameData();
  }, [gameId]);

  // Reset iframe states when game changes
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
  }, [game?.id]);

  const fetchGameData = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      
      if (response.ok) {
        const gameData = await response.json();
        console.log('InlineGame: Fetched game data:', gameData);
        console.log('InlineGame: Game type:', gameData.game_type);
        console.log('InlineGame: Game config:', gameData.game_config);
        console.log('InlineGame: Embed HTML:', gameData.embed_html);
        console.log('InlineGame: Width/Height:', gameData.width, gameData.height);
        console.log('InlineGame: Original URL:', gameData.original_url);
        
        // Debug embed HTML content
        if (gameData.embed_html) {
          console.log('InlineGame: Embed HTML length:', gameData.embed_html.length);
          console.log('InlineGame: Embed HTML preview:', gameData.embed_html.substring(0, 200) + '...');
          console.log('InlineGame: Full embed HTML:', gameData.embed_html);
        } else {
          console.log('InlineGame: No embed HTML found');
        }
        setGame(gameData);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = useCallback((gameScore: number = 100) => {
    setScore(gameScore);
    setPassed(true); // Games are typically considered passed when completed
    setGameCompleted(true);
    
    // Call the completion callback
    onComplete(gameScore, true);
  }, [onComplete]);

  const resetGame = useCallback(() => {
    setGameCompleted(false);
    setScore(null);
    setPassed(null);
    setIframeLoaded(false);
    setIframeError(false);
  }, []);

  const renderGame = useMemo(() => {
    if (!game) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Game Not Found</h3>
          <p className="text-gray-600">The game could not be loaded.</p>
        </div>
      );
    }

    // Handle Wordwall games (external embedded games)
    if (game.game_type === 'wordwall') {
      if (!game.embed_html) {
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800">
                <strong>Embed Code Not Found:</strong> This Wordwall game doesn't have embed code.
              </div>
            </div>
            
            {game.original_url ? (
              <div className="text-center">
                <a 
                  href={game.original_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  Open Game in New Tab
                </a>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">No game URL available.</p>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={() => handleGameComplete(100)}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Completed
              </Button>
            </div>
          </div>
        );
      }

      // Show error state if iframe failed to load
      if (iframeError) {
        return (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800">
                <strong>Loading Error:</strong> The game failed to load. You can try opening it in a new tab.
              </div>
            </div>
            
            {game.original_url && (
              <div className="text-center">
                <a 
                  href={game.original_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Play className="h-4 w-4" />
                  Open Game in New Tab
                </a>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={() => handleGameComplete(100)}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Completed
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <strong>External Game:</strong> This is a Wordwall game. Click the "Complete Game" button when you're done playing.
            </div>
          </div>
          
          <div className="flex justify-center">
            <div 
              className="border border-gray-300 rounded-lg overflow-hidden"
              style={{
                width: game.width ? `${game.width}px` : '100%',
                maxWidth: '100%',
                height: game.height ? `${game.height}px` : '600px'
              }}
            >
              {!iframeLoaded && (
                <div className="flex items-center justify-center bg-gray-100 h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading game...</p>
                    <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
                  </div>
                </div>
              )}
              {iframeLoaded && (
                <WordwallIframe
                  embedHtml={game.embed_html}
                  width={game.width}
                  height={game.height}
                  onLoad={() => setIframeLoaded(true)}
                  onError={() => setIframeError(true)}
                />
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={() => handleGameComplete(100)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Game
            </Button>
          </div>
        </div>
      );
    }

    // Handle custom games that require configuration
    if (!game.game_config) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Game Configuration Not Found</h3>
          <p className="text-gray-600">This game doesn't have the required configuration.</p>
        </div>
      );
    }

    // Parse game config if it's a string
    let config = game.game_config;
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config);
      } catch (e) {
        console.error('Error parsing game config:', e);
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Game Configuration</h3>
            <p className="text-gray-600">The game configuration could not be parsed.</p>
          </div>
        );
      }
    }

    // Extract nested configuration based on game type
    let gameConfig;
    console.log('InlineGame: Processing config for game type:', game.game_type);
    console.log('InlineGame: Raw config:', config);
    
    switch (game.game_type) {
      case 'memory':
        gameConfig = config.memory || config;
        break;
      case 'hangman':
        gameConfig = config.hangman || config;
        break;
      case 'flashcards':
        gameConfig = config.flashcards || config;
        break;
      case 'word_search':
        gameConfig = config.wordSearch || config;
        break;
      case 'word_mixup':
        gameConfig = config.wordMixup || config;
        break;
      case 'word_association':
        gameConfig = config.wordAssociation || config;
        break;
      case 'vocab_run':
        gameConfig = config.vocabRun || config;
        break;
      default:
        gameConfig = config;
    }
    
    console.log('InlineGame: Extracted game config:', gameConfig);
    
    // For some game types, we need to flatten the configuration structure
    // to match what the game components expect
    if (game.game_type === 'flashcards' && gameConfig.cards) {
      // Flashcards component expects config.cards directly
      gameConfig = {
        cards: gameConfig.cards,
        showTimer: gameConfig.showTimer,
        shuffle: gameConfig.shuffle
      };
    } else if (game.game_type === 'word_association' && gameConfig.pairs) {
      // WordAssociation component expects config.pairs directly
      gameConfig = {
        pairs: gameConfig.pairs,
        showTimer: gameConfig.showTimer,
        shuffle: gameConfig.shuffle,
        maxAttempts: gameConfig.maxAttempts
      };
    } else if (game.game_type === 'word_mixup' && gameConfig.sentences) {
      // WordMixup component expects config.sentences directly
      gameConfig = {
        sentences: gameConfig.sentences,
        showTimer: gameConfig.showTimer,
        allowHints: gameConfig.allowHints
      };
    } else if (game.game_type === 'word_search' && gameConfig.words) {
      // WordSearch component expects config.words directly
      gameConfig = {
        words: gameConfig.words,
        gridSize: gameConfig.gridSize,
        directions: gameConfig.directions
      };
    }
    
    console.log('InlineGame: Final flattened game config:', gameConfig);

    // Validate that we have the required configuration
    if (!gameConfig) {
      console.error('No game configuration found for type:', game.game_type);
      console.error('Available config keys:', Object.keys(config));
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Game Configuration</h3>
          <p className="text-gray-600">The game configuration is missing or invalid.</p>
          <p className="text-xs text-gray-500 mt-2">Game type: {game.game_type}</p>
          <p className="text-xs text-gray-500 mt-1">Debug: {JSON.stringify(config)}</p>
        </div>
      );
    }

    // Render the appropriate game component based on game type
    switch (game.game_type) {
      case 'memory':
        return (
          <MemoryGame 
            key={`memory-${game.id}`}
            config={gameConfig} 
            onComplete={handleGameComplete}
          />
        );
      case 'hangman':
        return (
          <HangmanGame 
            key={`hangman-${game.id}`}
            config={gameConfig} 
            onComplete={handleGameComplete}
          />
        );
      case 'flashcards':
        return (
          <FlashcardsGame 
            key={`flashcards-${game.id}`}
            config={gameConfig} 
            onComplete={handleGameComplete}
          />
        );
      case 'word_search':
        return (
          <WordSearchGame 
            key={`wordsearch-${game.id}`}
            config={gameConfig} 
            onComplete={handleGameComplete}
          />
        );
      case 'word_mixup':
        return (
          <WordMixupGame 
            key={`wordmixup-${game.id}`}
            config={gameConfig} 
            onComplete={handleGameComplete}
          />
        );
      case 'word_association':
        return (
          <WordAssociationGame 
            key={`wordassociation-${game.id}`}
            config={gameConfig} 
            onComplete={handleGameComplete}
          />
        );
      case 'vocab_run':
        return (
          <VocabRunGame
            key={`vocabrun-${game.id}`}
            config={gameConfig}
            onComplete={() => handleGameComplete(100)}
          />
        );
      case 'wordwall':
        // Wordwall games are handled above in the renderGame function
        // This case should never be reached, but included for completeness
        return null;
      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unsupported Game Type</h3>
            <p className="text-gray-600">Game type "{game.game_type}" is not supported in inline mode.</p>
          </div>
        );
    }
  }, [game?.id, game?.game_type, game?.game_config, game?.embed_html, handleGameComplete]);

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading game...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!game) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Game not found</h3>
            <p className="text-gray-600">The game could not be loaded.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          {game.title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Badge variant="outline">{game.game_type}</Badge>
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Game
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!gameCompleted ? (
          <>
            <div className="mb-6">
              <p className="text-gray-700">{game.description}</p>
            </div>
            
            {renderGame}

            {/* Reset removed by design */}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">
              Game Completed!
            </h3>
            
            <p className="text-lg mb-4">
              Your score: <span className="font-bold">{score}%</span>
            </p>
            
            <p className="text-gray-600 mb-6">
              Congratulations! You've successfully completed the game.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={resetGame}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Play Again
              </Button>
              
              <Button
                onClick={onNext}
                className="flex items-center gap-2"
              >
                Continue
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

InlineGame.displayName = 'InlineGame';
