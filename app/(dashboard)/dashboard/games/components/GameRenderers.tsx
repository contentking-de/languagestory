'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  RotateCcw, 
  Check, 
  X, 
  Play, 
  Pause,
  Timer,
  Star,
  Trophy
} from 'lucide-react';

interface MemoryGameProps {
  config: {
    cards: Array<{ id: string; word: string; translation: string; image?: string }>;
    gridSize: number;
    timeLimit?: number;
  };
  onComplete?: (score: number) => void;
}

export function MemoryGame({ config, onComplete }: MemoryGameProps) {
  // Debug logging
  console.log('MemoryGame: config received:', config);
  console.log('MemoryGame: config type:', typeof config);
  console.log('MemoryGame: config.cards:', config?.cards);
  
  // Validate config
  if (!config || !config.cards || !Array.isArray(config.cards) || config.cards.length === 0) {
    console.log('MemoryGame: Validation failed');
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid game configuration</p>
          <p className="text-xs text-gray-400 mt-2">Debug: {JSON.stringify(config)}</p>
        </div>
      </div>
    );
  }

  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);

  // Create pairs of cards (word + translation) and shuffle them only once
  const shuffledCards = useMemo(() => {
    const gameCards = config.cards.flatMap(card => [
      { id: `${card.id}-word`, content: card.word, type: 'word', pairId: card.id },
      { id: `${card.id}-translation`, content: card.translation, type: 'translation', pairId: card.id }
    ]);
    return [...gameCards].sort(() => Math.random() - 0.5);
  }, [config.cards]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  const handleCardClick = (index: number) => {
    if (!gameStarted) setGameStarted(true);
    
    // Don't allow clicking if 2 cards are already flipped (waiting for match check)
    if (flippedCards.length === 2) return;
    
    // Don't allow clicking already matched cards
    if (matchedPairs.includes(shuffledCards[index].pairId)) return;
    
    // Don't allow clicking already flipped cards
    if (flippedCards.includes(index)) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      setIsCheckingMatch(true);
      
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = shuffledCards[firstIndex];
      const secondCard = shuffledCards[secondIndex];

      // Check if one card is a word and the other is its translation
      const isMatch = firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type;

      if (isMatch) {
        // Match found - both cards stay open
        setMatchedPairs(prev => [...prev, firstCard.pairId]);
        setFlippedCards([]);
        setIsCheckingMatch(false);
        
        // Check if game is completed
        if (matchedPairs.length + 1 === config.cards.length) {
          setGameCompleted(true);
          // Calculate score based on time and moves
          const timeScore = Math.max(0, 100 - Math.floor(timeElapsed / 10));
          const moveScore = Math.max(0, 100 - moves * 2);
          const finalScore = Math.round((timeScore + moveScore) / 2);
          onComplete?.(finalScore);
        }
      } else {
        // No match - flip both cards back after delay
        setTimeout(() => {
          setFlippedCards([]);
          setIsCheckingMatch(false);
        }, 1500);
      }
    }
  };

  const resetGame = () => {
    setFlippedCards([]);
    setMatchedPairs([]);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
    setMoves(0);
    setIsCheckingMatch(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 sm:p-4 rounded-lg gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Time</div>
            <div className="text-lg sm:text-xl font-bold">{formatTime(timeElapsed)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Moves</div>
            <div className="text-lg sm:text-xl font-bold">{moves}</div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Pairs</div>
            <div className="text-lg sm:text-xl font-bold">{matchedPairs.length}/{config.cards.length}</div>
          </div>
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs">
          <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Reset
        </Button>
      </div>

      {/* Game Status */}
      {isCheckingMatch && (
        <div className="text-center py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800 font-medium">Checking for match...</p>
        </div>
      )}

      {/* Game Grid */}
      <div 
        className="grid gap-2 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${Math.min(Math.ceil(Math.sqrt(config.cards.length * 2)), 4)}, 1fr)`,
          maxWidth: '600px'
        }}
      >
        {shuffledCards.map((card, index) => {
          const isFlipped = flippedCards.includes(index);
          const isMatched = matchedPairs.includes(card.pairId);
          const isVisible = isFlipped || isMatched;

          return (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-300 ${
                isMatched 
                  ? 'bg-green-100 border-green-300 shadow-lg' 
                  : isFlipped 
                    ? isCheckingMatch 
                      ? 'bg-yellow-50 border-yellow-300 shadow-md animate-pulse' 
                      : 'bg-blue-50 border-blue-300 shadow-md' 
                    : 'hover:shadow-md'
              }`}
              onClick={() => handleCardClick(index)}
            >
              <CardContent className="p-2 sm:p-4 h-16 sm:h-24 flex items-center justify-center text-center">
                {isVisible ? (
                  <div className="text-xs sm:text-sm font-medium">
                    {card.content}
                    <div className={`text-xs mt-1 capitalize ${
                      isMatched ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {card.type}
                    </div>
                  </div>
                ) : (
                  <div className="text-xl sm:text-2xl">❓</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Game Completion */}
      {gameCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center p-4 sm:p-6 rounded-lg">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Congratulations!</h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">You've completed the memory game!</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <div className="opacity-90">Final Time</div>
              <div className="font-bold">{formatTime(timeElapsed)}</div>
            </div>
            <div>
              <div className="opacity-90">Total Moves</div>
              <div className="font-bold">{moves}</div>
            </div>
            <div>
              <div className="opacity-90">Accuracy</div>
              <div className="font-bold">
                {Math.round((config.cards.length / moves) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface HangmanGameProps {
  config: {
    words: string[];
    hints: string[];
    maxAttempts: number;
  };
  onComplete?: (score: number) => void;
}

export function HangmanGame({ config, onComplete }: HangmanGameProps) {
  // Debug logging
  console.log('HangmanGame: config received:', config);
  console.log('HangmanGame: config type:', typeof config);
  console.log('HangmanGame: config.words:', config?.words);
  
  // Validate config
  if (!config || !config.words || !Array.isArray(config.words) || config.words.length === 0) {
    console.log('HangmanGame: Validation failed');
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid game configuration</p>
          <p className="text-xs text-gray-400 mt-2">Debug: {JSON.stringify(config)}</p>
        </div>
      </div>
    );
  }

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  const currentWord = config.words[currentWordIndex].toLowerCase();
  const currentHint = config.hints[currentWordIndex];

  const displayWord = currentWord
    .split('')
    .map(letter => guessedLetters.includes(letter) ? letter : '_')
    .join(' ');

  const handleLetterGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || gameWon || gameLost) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= config.maxAttempts) {
        setGameLost(true);
      }
    } else {
      // Check if word is complete
      const isWordComplete = currentWord
        .split('')
        .every(char => newGuessedLetters.includes(char));
      
      if (isWordComplete) {
        setGameWon(true);
        // Check if all words are completed
        if (currentWordIndex + 1 >= config.words.length) {
          const accuracy = Math.round(((config.words.length - wrongGuesses) / config.words.length) * 100);
          onComplete?.(Math.max(accuracy, 0));
        }
      }
    }
  };

  const nextWord = () => {
    if (currentWordIndex < config.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameWon(false);
      setGameLost(false);
    }
  };

  const resetGame = () => {
    setCurrentWordIndex(0);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameWon(false);
    setGameLost(false);
  };

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Hangman</h3>
        <p className="text-sm text-gray-600">Word {currentWordIndex + 1} of {config.words.length}</p>
        <p className="text-lg font-medium mt-2">{currentHint}</p>
      </div>

      {/* Hangman Drawing */}
      <div className="flex justify-center">
        <div className="w-32 h-32 border-2 border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-4xl">
            {wrongGuesses >= 1 && '😵'}
            {wrongGuesses === 0 && '😊'}
          </div>
        </div>
      </div>

      {/* Word Display */}
      <div className="text-center">
        <div className="text-3xl font-mono font-bold tracking-widest mb-4">
          {displayWord}
        </div>
        <div className="text-sm text-gray-600">
          Wrong guesses: {wrongGuesses}/{config.maxAttempts}
        </div>
      </div>

      {/* Letter Grid */}
      <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
        {alphabet.map(letter => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = currentWord.includes(letter);
          
          return (
            <Button
              key={letter}
              onClick={() => handleLetterGuess(letter)}
              disabled={isGuessed || gameWon || gameLost}
              variant={isGuessed ? (isCorrect ? 'default' : 'destructive') : 'outline'}
              size="sm"
              className="w-10 h-10"
            >
              {letter.toUpperCase()}
            </Button>
          );
        })}
      </div>

      {/* Game Result */}
      {(gameWon || gameLost) && (
        <Card className="text-center p-6">
          <CardContent>
            {gameWon ? (
              <div className="text-green-600">
                <Check className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Correct!</h3>
                <p>The word was: <span className="font-bold">{currentWord}</span></p>
              </div>
            ) : (
              <div className="text-red-600">
                <X className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Game Over!</h3>
                <p>The word was: <span className="font-bold">{currentWord}</span></p>
              </div>
            )}
            
            <div className="mt-4 space-x-2">
              {currentWordIndex < config.words.length - 1 && (
                <Button onClick={nextWord}>
                  Next Word
                </Button>
              )}
              <Button variant="outline" onClick={resetGame}>
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FlashcardsGameProps {
  config: {
    cards: Array<{ front: string; back: string; image?: string }>;
    showTimer: boolean;
    shuffle: boolean;
  };
  onComplete?: (score: number) => void;
}

export function FlashcardsGame({ config, onComplete }: FlashcardsGameProps) {
  // Validate config
  if (!config || !config.cards || !Array.isArray(config.cards) || config.cards.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid game configuration</p>
        </div>
      </div>
    );
  }

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTimer, setShowTimer] = useState(config.showTimer);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const cards = config.shuffle ? [...config.cards].sort(() => Math.random() - 0.5) : config.cards;
  const currentCard = cards[currentCardIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && showTimer) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, showTimer]);

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // All cards viewed, consider game complete
      const timeScore = Math.max(0, 100 - Math.floor(timeElapsed / 10));
      onComplete?.(timeScore);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const resetCards = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setTimeElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <h3 className="text-xl font-bold">Flashcards</h3>
          <p className="text-sm text-gray-600">
            Card {currentCardIndex + 1} of {cards.length}
          </p>
        </div>
        {showTimer && (
          <div className="text-center">
            <div className="text-sm text-gray-600">Time</div>
            <div className="text-lg font-bold">{formatTime(timeElapsed)}</div>
          </div>
        )}
      </div>

      {/* Flashcard */}
      <Card 
        className="cursor-pointer transition-all duration-300 transform hover:shadow-lg"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="p-8 min-h-48 flex items-center justify-center text-center">
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              {isFlipped ? currentCard.back : currentCard.front}
            </div>
            {isFlipped && (
              <div className="text-sm text-gray-500">
                Click to flip back
              </div>
            )}
            {!isFlipped && (
              <div className="text-sm text-gray-500">
                Click to reveal answer
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          onClick={previousCard} 
          disabled={currentCardIndex === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button onClick={() => setIsFlipped(!isFlipped)}>
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </Button>
        <Button 
          onClick={nextCard} 
          disabled={currentCardIndex === cards.length - 1}
          variant="outline"
        >
          Next
        </Button>
      </div>

      {/* Progress */}
      <div className="flex justify-center">
        <div className="flex gap-1">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentCardIndex 
                  ? 'bg-blue-500' 
                  : index < currentCardIndex 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button onClick={resetCards} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={() => setIsPlaying(!isPlaying)} 
          variant="outline" 
          size="sm"
        >
          {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {isPlaying ? 'Pause Timer' : 'Start Timer'}
        </Button>
      </div>
    </div>
  );
} 

interface WordSearchGameProps {
  config: {
    words: string[];
    gridSize: number;
    directions: string[];
  };
  onComplete?: (score: number) => void;
}

export function WordSearchGame({ config, onComplete }: WordSearchGameProps) {
  // Validate config
  if (!config || !config.words || !Array.isArray(config.words) || config.words.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid game configuration</p>
        </div>
      </div>
    );
  }

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[][]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Helper functions for word placement
  const canPlaceWord = (grid: string[][], word: string, row: number, col: number, direction: string): boolean => {
    const size = grid.length;
    const wordLength = word.length;
    
    for (let i = 0; i < wordLength; i++) {
      let r = row, c = col;
      
      switch (direction) {
        case 'horizontal':
          c = col + i;
          break;
        case 'vertical':
          r = row + i;
          break;
        case 'diagonal':
          r = row + i;
          c = col + i;
          break;
      }
      
      if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] !== '' && grid[r][c] !== word[i])) {
        return false;
      }
    }
    return true;
  };

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: string) => {
    for (let i = 0; i < word.length; i++) {
      let r = row, c = col;
      
      switch (direction) {
        case 'horizontal':
          c = col + i;
          break;
        case 'vertical':
          r = row + i;
          break;
        case 'diagonal':
          r = row + i;
          c = col + i;
          break;
      }
      
      grid[r][c] = word[i];
    }
  };

  const getWordPositions = (row: number, col: number, direction: string, length: number): number[][] => {
    const positions: number[][] = [];
    for (let i = 0; i < length; i++) {
      let r = row, c = col;
      
      switch (direction) {
        case 'horizontal':
          c = col + i;
          break;
        case 'vertical':
          r = row + i;
          break;
        case 'diagonal':
          r = row + i;
          c = col + i;
          break;
      }
      
      positions.push([r, c]);
    }
    return positions;
  };

  // Generate the word search grid - use useRef to prevent re-generation on timer updates
  const gridRef = useRef<{ grid: string[][], wordPositions: { [key: string]: number[][] } } | null>(null);
  
  if (!gridRef.current) {
    // Use a more manageable grid size: 10 columns x 15 rows instead of 15x15
    const cols = 10;
    const rows = Math.ceil((config.gridSize || 15) * 1.5); // More rows to compensate for fewer columns
    const grid = Array(rows).fill(null).map(() => Array(cols).fill(''));
    const wordPositions: { [key: string]: number[][] } = {};
    
    // Place words in the grid
    config.words.forEach(word => {
      const upperWord = word.toUpperCase();
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = config.directions[Math.floor(Math.random() * config.directions.length)];
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        if (canPlaceWord(grid, upperWord, row, col, direction)) {
          placeWord(grid, upperWord, row, col, direction);
          wordPositions[word] = getWordPositions(row, col, direction, upperWord.length);
          console.log(`Placed word "${word}" at [${row},${col}] direction: ${direction}, positions:`, wordPositions[word]);
          placed = true;
        }
        attempts++;
      }
      
      if (!placed) {
        console.warn(`Failed to place word: ${word}`);
      }
    });
    
    // Check for overlapping words
    console.log('Final word positions:', wordPositions);
    Object.entries(wordPositions).forEach(([word1, positions1]) => {
      Object.entries(wordPositions).forEach(([word2, positions2]) => {
        if (word1 !== word2) {
          const overlap = positions1.filter(pos1 => 
            positions2.some(pos2 => pos1[0] === pos2[0] && pos1[1] === pos2[1])
          );
          if (overlap.length > 0) {
            console.warn(`Overlap between "${word1}" and "${word2}":`, overlap);
          }
        }
      });
    });
    
    // Fill empty cells with random letters
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    
    gridRef.current = { grid, wordPositions };
  }
  
  const { grid, wordPositions } = gridRef.current;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted) setGameStarted(true);
    if (gameCompleted) return;
    
    console.log(`=== CELL CLICK: [${row}, ${col}] ===`);
    console.log('Current found words:', foundWords);
    console.log('Current selected cells:', selectedCells);
    
    // Check if this cell is part of a word
    const clickedCell = [row, col];
    const isPartOfWord = Object.values(wordPositions).some(positions => 
      positions.some(pos => pos[0] === row && pos[1] === col)
    );
    
    if (!isPartOfWord) {
      console.log('Cell is not part of any word, ignoring');
      return;
    }
    
    console.log('Cell is part of a word, adding to selection');
    
    // Add to selection (don't toggle)
    setSelectedCells(prev => {
      const isSelected = prev.some(cell => cell[0] === row && cell[1] === col);
      if (isSelected) {
        console.log('Cell already selected, keeping current selection');
        return prev; // Keep it selected
      } else {
        const newSelection = [...prev, clickedCell];
        console.log('New selection:', newSelection);
        
        // Check each word individually
        let foundNewWord = false;
        
        Object.entries(wordPositions).forEach(([word, positions]) => {
          console.log(`\n--- Checking word: "${word}" ---`);
          console.log('Word positions:', positions);
          console.log('Current selection:', newSelection);
          
          // Check if ALL positions of this word are in the current selection
          const isFound = positions.every(pos => 
            newSelection.some(cell => cell[0] === pos[0] && cell[1] === pos[1])
          );
          
          // Check if the selection length matches the word length (exact match)
          const isExactMatch = newSelection.length === positions.length;
          
          console.log(`isFound: ${isFound}, isExactMatch: ${isExactMatch}, alreadyFound: ${foundWords.includes(word)}`);
          
          // Only consider if not already found, all positions match, and exact length match
          if (isFound && isExactMatch && !foundWords.includes(word)) {
            console.log(`*** FOUND NEW WORD: "${word}" ***`);
            setFoundWords(prevFound => {
              // Double-check that the word isn't already in the list
              if (prevFound.includes(word)) {
                console.log(`*** WORD "${word}" ALREADY EXISTS, IGNORING ***`);
                return prevFound;
              }
              
              const newFoundWords = [...prevFound, word];
              console.log(`*** UPDATED FOUND WORDS: ${newFoundWords.join(', ')} (${newFoundWords.length}/${config.words.length}) ***`);
              
              // Check if all words are found
              if (newFoundWords.length === config.words.length) {
                console.log('*** GAME COMPLETED! ***');
                setGameCompleted(true);
                const timeScore = Math.max(0, 100 - Math.floor(timeElapsed / 10));
                onComplete?.(timeScore);
              }
              
              return newFoundWords;
            });
            
            foundNewWord = true;
          }
        });
        
        // Clear the selection if we found a word
        if (foundNewWord) {
          console.log('*** CLEARING SELECTION AFTER FINDING WORD ***');
          return [];
        }
        
        return newSelection;
      }
    });
  };

  const resetGame = () => {
    setFoundWords([]);
    setSelectedCells([]);
    setGameCompleted(false);
    setTimeElapsed(0);
    setGameStarted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(([r, c]) => r === row && c === col);
  };

  const isCellInFoundWord = (row: number, col: number) => {
    return foundWords.some(word => 
      wordPositions[word]?.some(([r, c]) => r === row && c === col)
    );
  };

  // Debug: Log current state
  useEffect(() => {
    console.log('Current found words:', foundWords);
    console.log('Word positions:', wordPositions);
  }, [foundWords, wordPositions]);

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 sm:p-4 rounded-lg gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Time</div>
            <div className="text-lg sm:text-xl font-bold">{formatTime(timeElapsed)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Found</div>
            <div className="text-lg sm:text-xl font-bold">{foundWords.length}/{config.words.length}</div>
          </div>
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs">
          <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Reset
        </Button>
      </div>

      {/* Word List */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm">Words to Find:</h4>
        <div className="flex flex-wrap gap-2">
          {config.words.map((word, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-xs font-medium ${
                foundWords.includes(word)
                  ? 'bg-green-100 text-green-800 line-through'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Word Search Grid */}
      <div className="flex justify-center overflow-x-auto px-4">
        <div 
          className="grid gap-0.5 sm:gap-1 p-4"
          style={{ 
            gridTemplateColumns: `repeat(${grid[0].length}, 28px)`,
            width: 'fit-content'
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-7 h-7 sm:w-8 sm:h-8
                  flex items-center justify-center 
                  text-xs sm:text-sm font-bold cursor-pointer rounded
                  transition-all duration-200 select-none overflow-hidden
                  ${
                    isCellInFoundWord(rowIndex, colIndex)
                      ? 'bg-green-500 text-white'
                      : isCellSelected(rowIndex, colIndex)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-100'
                  }
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                <span className="truncate">{cell}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>Click on letters to select them. Find all the hidden words!</p>
      </div>

      {/* Game Completion */}
      {gameCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center p-4 sm:p-6 rounded-lg">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Congratulations!</h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">You've found all the words!</p>
          <div className="text-sm">
            <div className="font-bold">Final Time: {formatTime(timeElapsed)}</div>
          </div>
        </div>
      )}
    </div>
  );
} 

interface WordMixupGameProps {
  config: {
    sentences: Array<{ id: string; sentence: string; hint?: string }>;
    showTimer: boolean;
    allowHints: boolean;
  };
  onComplete?: (score: number) => void;
}

export function WordMixupGame({ config, onComplete }: WordMixupGameProps) {
  // Validate config
  if (!config || !config.sentences || !Array.isArray(config.sentences) || config.sentences.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid game configuration</p>
        </div>
      </div>
    );
  }

  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Initialize the current sentence
  useEffect(() => {
    if (config.sentences.length > 0) {
      const currentSentence = config.sentences[currentSentenceIndex];
      const words = currentSentence.sentence.split(' ').filter(word => word.trim());
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setScrambledWords(shuffled);
      setRemainingWords(shuffled);
      setSelectedWords([]);
      setShowHint(false);
    }
  }, [currentSentenceIndex, config.sentences]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameCompleted && config.showTimer) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, config.showTimer]);

  const handleWordSelect = (word: string, index: number) => {
    if (!gameStarted) setGameStarted(true);
    
    const newSelectedWords = [...selectedWords, word];
    const newRemainingWords = remainingWords.filter((_, i) => i !== index);
    
    setSelectedWords(newSelectedWords);
    setRemainingWords(newRemainingWords);
    setMoves(prev => prev + 1);

    // Check if sentence is complete
    const currentSentence = config.sentences[currentSentenceIndex];
    const correctWords = currentSentence.sentence.split(' ').filter(word => word.trim());
    const isComplete = newSelectedWords.length === correctWords.length;
    
    if (isComplete) {
      const isCorrect = newSelectedWords.every((word, i) => word === correctWords[i]);
      if (isCorrect) {
        if (currentSentenceIndex + 1 >= config.sentences.length) {
          setGameCompleted(true);
          const timeScore = Math.max(0, 100 - Math.floor(timeElapsed / 10));
          const moveScore = Math.max(0, 100 - moves * 2);
          const finalScore = Math.round((timeScore + moveScore) / 2);
          onComplete?.(finalScore);
        } else {
          setCurrentSentenceIndex(prev => prev + 1);
        }
      } else {
        // Wrong order, reset
        setTimeout(() => {
          setSelectedWords([]);
          setRemainingWords(scrambledWords);
        }, 1000);
      }
    }
  };

  const handleWordDeselect = (word: string, index: number) => {
    const newSelectedWords = selectedWords.filter((_, i) => i !== index);
    const newRemainingWords = [...remainingWords, word];
    
    setSelectedWords(newSelectedWords);
    setRemainingWords(newRemainingWords);
    setMoves(prev => prev + 1);
  };

  const resetCurrentSentence = () => {
    const currentSentence = config.sentences[currentSentenceIndex];
    const words = currentSentence.sentence.split(' ').filter(word => word.trim());
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setRemainingWords(shuffled);
    setSelectedWords([]);
    setShowHint(false);
  };

  const resetGame = () => {
    setCurrentSentenceIndex(0);
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
    setMoves(0);
    setShowHint(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (config.sentences.length === 0) {
    return <div className="text-center text-gray-500">No sentences configured</div>;
  }

  const currentSentence = config.sentences[currentSentenceIndex];

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 sm:p-4 rounded-lg gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Sentence</div>
            <div className="text-lg sm:text-xl font-bold">{currentSentenceIndex + 1}/{config.sentences.length}</div>
          </div>
          {config.showTimer && (
            <div className="text-center">
              <div className="text-xs sm:text-sm opacity-90">Time</div>
              <div className="text-lg sm:text-xl font-bold">{formatTime(timeElapsed)}</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Moves</div>
            <div className="text-lg sm:text-xl font-bold">{moves}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {config.allowHints && currentSentence.hint && (
            <Button 
              onClick={() => setShowHint(!showHint)} 
              variant="outline" 
              size="sm" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs"
            >
              💡 Hint
            </Button>
          )}
          <Button onClick={resetCurrentSentence} variant="outline" size="sm" className="bg-white text-purple-600 border-white hover:bg-gray-100 font-medium text-xs">
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Hint */}
      {showHint && currentSentence.hint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800">
            <strong>Hint:</strong> {currentSentence.hint}
          </div>
        </div>
      )}

      {/* Selected Words (Building the sentence) */}
      <div className="bg-gray-50 p-4 rounded-lg min-h-[60px]">
        <div className="text-sm text-gray-600 mb-2">Your sentence:</div>
        <div className="flex flex-wrap gap-2">
          {selectedWords.map((word, index) => (
            <button
              key={`selected-${index}`}
              onClick={() => handleWordDeselect(word, index)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer"
            >
              {word}
            </button>
          ))}
          {selectedWords.length === 0 && (
            <div className="text-gray-400 italic">Click words below to build your sentence</div>
          )}
        </div>
      </div>

      {/* Remaining Words */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">Available words:</div>
        <div className="flex flex-wrap gap-2">
          {remainingWords.map((word, index) => (
            <button
              key={`remaining-${index}`}
              onClick={() => handleWordSelect(word, index)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Game Completion */}
      {gameCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center p-4 sm:p-6 rounded-lg">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Congratulations!</h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">You've completed all sentences!</p>
          <div className="text-sm space-y-1">
            <div className="font-bold">Final Time: {formatTime(timeElapsed)}</div>
            <div className="font-bold">Total Moves: {moves}</div>
          </div>
          <Button onClick={resetGame} className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30">
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
} 

interface WordAssociationGameProps {
  config: {
    pairs: Array<{ id: string; word1: string; word2: string; category?: string }>;
    showTimer: boolean;
    shuffle: boolean;
    maxAttempts: number;
  };
  onComplete?: (score: number) => void;
}

export function WordAssociationGame({ config, onComplete }: WordAssociationGameProps) {
  // Validate config
  if (!config || !config.pairs || !Array.isArray(config.pairs) || config.pairs.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid game configuration</p>
        </div>
      </div>
    );
  }

  const [allWords, setAllWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize the game
  useEffect(() => {
    if (config.pairs.length > 0) {
      const words = config.pairs.flatMap(pair => [pair.word1, pair.word2]);
      const shuffled = config.shuffle ? [...words].sort(() => Math.random() - 0.5) : words;
      setAllWords(shuffled);
      setSelectedWords([]);
      setMatchedPairs(new Set());
      setAttempts(0);
    }
  }, [config.pairs, config.shuffle]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameCompleted && config.showTimer) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted, config.showTimer]);

  const handleWordClick = (word: string) => {
    if (!gameStarted) setGameStarted(true);
    if (gameCompleted) return;
    if (matchedPairs.has(word)) return; // Already matched

    const newSelectedWords = [...selectedWords, word];
    setSelectedWords(newSelectedWords);

    if (newSelectedWords.length === 2) {
      setAttempts(prev => prev + 1);
      
      // Check if the selected words form a valid pair
      const isPair = config.pairs.some(pair => 
        (pair.word1 === newSelectedWords[0] && pair.word2 === newSelectedWords[1]) ||
        (pair.word1 === newSelectedWords[1] && pair.word2 === newSelectedWords[0])
      );

      if (isPair) {
        // Correct match
        const pairKey = `${newSelectedWords[0]}-${newSelectedWords[1]}`;
        setMatchedPairs(prev => new Set([...prev, newSelectedWords[0], newSelectedWords[1]]));
        setShowFeedback({ type: 'success', message: 'Great match! 🎉' });
        
        // Check if game is complete
        if (matchedPairs.size + 2 === allWords.length) {
          setGameCompleted(true);
          const timeScore = Math.max(0, 100 - Math.floor(timeElapsed / 10));
          const attemptScore = Math.max(0, 100 - attempts * 5);
          const finalScore = Math.round((timeScore + attemptScore) / 2);
          onComplete?.(finalScore);
        }
      } else {
        // Wrong match
        setShowFeedback({ type: 'error', message: 'Try again! 💡' });
      }

      // Clear selection after a delay
      setTimeout(() => {
        setSelectedWords([]);
        setShowFeedback(null);
      }, 1500);
    }
  };

  const resetGame = () => {
    const words = config.pairs.flatMap(pair => [pair.word1, pair.word2]);
    const shuffled = config.shuffle ? [...words].sort(() => Math.random() - 0.5) : words;
    setAllWords(shuffled);
    setSelectedWords([]);
    setMatchedPairs(new Set());
    setGameStarted(false);
    setGameCompleted(false);
    setTimeElapsed(0);
    setAttempts(0);
    setShowFeedback(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordStatus = (word: string) => {
    if (matchedPairs.has(word)) return 'matched';
    if (selectedWords.includes(word)) return 'selected';
    return 'available';
  };

  if (config.pairs.length === 0) {
    return <div className="text-center text-gray-500">No word pairs configured</div>;
  }

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 sm:p-4 rounded-lg gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Matched</div>
            <div className="text-lg sm:text-xl font-bold">{matchedPairs.size / 2}/{config.pairs.length}</div>
          </div>
          {config.showTimer && (
            <div className="text-center">
              <div className="text-xs sm:text-sm opacity-90">Time</div>
              <div className="text-lg sm:text-xl font-bold">{formatTime(timeElapsed)}</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs sm:text-sm opacity-90">Attempts</div>
            <div className="text-lg sm:text-xl font-bold">{attempts}/{config.maxAttempts}</div>
          </div>
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="bg-white text-purple-600 border-white hover:bg-gray-100 font-medium text-xs">
          <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Reset
        </Button>
      </div>

      {/* Feedback Message */}
      {showFeedback && (
        <div className={`p-3 rounded-lg text-center font-medium ${
          showFeedback.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {showFeedback.message}
        </div>
      )}

      {/* Game Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <strong>Instructions:</strong> Click on two words that are related to each other. Match all pairs to complete the game!
        </div>
      </div>

      {/* Word Grid */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">Click to select words:</div>
        <div className="flex flex-wrap gap-3">
          {allWords.map((word, index) => {
            const status = getWordStatus(word);
            return (
              <button
                key={`${word}-${index}`}
                onClick={() => handleWordClick(word)}
                disabled={status === 'matched'}
                className={`
                  px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  min-h-[44px] min-w-[80px] max-w-[200px] flex items-center justify-center text-center
                  ${status === 'matched' 
                    ? 'bg-green-500 text-white cursor-not-allowed' 
                    : status === 'selected'
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-md'
                  }
                `}
              >
                <span className="break-words leading-tight">{word}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Over - Max Attempts Reached */}
      {attempts >= config.maxAttempts && !gameCompleted && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-800 font-medium mb-2">Maximum attempts reached!</div>
          <Button onClick={resetGame} variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
            Try Again
          </Button>
        </div>
      )}

      {/* Game Completion */}
      {gameCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center p-4 sm:p-6 rounded-lg">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Excellent!</h3>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">You've matched all word associations!</p>
          <div className="text-sm space-y-1">
            <div className="font-bold">Final Time: {formatTime(timeElapsed)}</div>
            <div className="font-bold">Total Attempts: {attempts}</div>
          </div>
          <Button onClick={resetGame} className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30">
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
} 

// Vocab Run Game
interface VocabRunGameProps {
  config: {
    questions: Array<{ id: string; question: string; options: string[]; correctIndex: number }>;
  };
  onComplete?: (score: number, passed: boolean) => void;
}

export function VocabRunGame({ config, onComplete }: VocabRunGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [frogXPct, setFrogXPct] = useState(50);
  const [frogLevel, setFrogLevel] = useState(-1); // start below first lily pad
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());
  const [frogLeftPx, setFrogLeftPx] = useState<number | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return null;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  };

  // Stretch factor to slow down short SFX (higher = slower/longer)
  const sfxStretch = 1.8;

  // Bright, positive chime for successful jumps
  const playChime = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Envelope
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.9, now + 0.015 * sfxStretch);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.9 * sfxStretch);

    // Slight highpass to brighten
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(400, now);

    // Small stereo feel
    const splitter = ctx.createChannelSplitter(2);
    const merger = ctx.createChannelMerger(2);

    // Bell-like partials (major triad stacked): C6, E6, G6
    const freqs = [1047, 1319, 1568];
    const gains = [0.9, 0.6, 0.5];
    const oscs: OscillatorNode[] = [];
    const partialGain = ctx.createGain();
    partialGain.gain.setValueAtTime(0.9, now);

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      // subtle upward glide for sparkle
      osc.frequency.linearRampToValueAtTime(f * 1.02, now + 0.25 * sfxStretch);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gains[i], now);
      osc.connect(g);
      g.connect(partialGain);
      oscs.push(osc);
    });

    // Light stereo spread
    partialGain.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 1);
    merger.connect(hp);
    hp.connect(env);
    env.connect(ctx.destination);

    oscs.forEach((o) => {
      o.start(now);
      o.stop(now + 1.0 * sfxStretch);
    });
  };

  const playFrogCroak = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Helper to create one croak burst (formant-filtered, AM-modulated, with slight pitch glide)
    const createBurst = (startOffset: number, baseFreq: number, dur: number, brighter = false) => {
      const start = now + startOffset;

      // Source 1: low triangle for body
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, start);
      // Positive rising inflection, dann sanft zurück
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.12, start + dur * 0.35);
      osc.frequency.exponentialRampToValueAtTime(Math.max(130, baseFreq * 0.9), start + dur);

      // Source 2: very subtle noise for rasp
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const nb = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const ch = nb.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) ch[i] = (Math.random() * 2 - 1) * 0.02; // etwas weniger Rauschen
      const noise = ctx.createBufferSource();
      noise.buffer = nb;

      // Formants (bandpass filters) to mimic croak resonance
      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass';
      bp1.frequency.setValueAtTime(brighter ? 380 : 320, start);
      bp1.Q.setValueAtTime(7.5, start);

      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.setValueAtTime(brighter ? 820 : 680, start);
      bp2.Q.setValueAtTime(4.5, start);

      // Lowpass to tame highs
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(brighter ? 1800 : 1400, start);

      // Amplitude envelope
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(1.0, start + 0.035 * sfxStretch);
      env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      // Amplitude modulation (tremolo) ~20-28 Hz
      const trem = ctx.createOscillator();
      trem.type = 'sine';
      trem.frequency.setValueAtTime(24, start);
      const tremGain = ctx.createGain();
      tremGain.gain.setValueAtTime(0.35, start); // weniger stark, freundlicher
      trem.connect(tremGain);
      tremGain.connect(env.gain);

      // Cheer-Tone Layer (leiser, höherer Dreieckston) für positiven Charakter
      const cheer = ctx.createOscillator();
      cheer.type = 'triangle';
      cheer.frequency.setValueAtTime(baseFreq * 3.2, start);
      cheer.frequency.linearRampToValueAtTime(baseFreq * 3.6, start + dur * 0.5);
      const cheerGain = ctx.createGain();
      cheerGain.gain.setValueAtTime(0, start);
      cheerGain.gain.linearRampToValueAtTime(0.12, start + 0.03 * sfxStretch);
      cheerGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      // Routing
      osc.connect(bp1);
      osc.connect(bp2);
      noise.connect(bp1);
      noise.connect(bp2);
      bp1.connect(lp);
      bp2.connect(lp);
      lp.connect(env);
      env.connect(ctx.destination);
      cheer.connect(env);

      // Schedule
      trem.start(start);
      osc.start(start);
      noise.start(start);
      cheer.start(start);
      trem.stop(start + dur);
      osc.stop(start + dur);
      noise.stop(start + dur);
      cheer.stop(start + dur);
    };

    // Two-burst "rib-bit" style croak, stretched by sfxStretch
    const burstDur1 = 0.24 * sfxStretch;
    const burstDur2 = 0.32 * sfxStretch;
    createBurst(0, 230, burstDur1, true);                  // heller, "rib"
    createBurst(0.14 * sfxStretch, 190, burstDur2, true);  // ebenfalls hell, "bit"
  };

  const playSplash = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const duration = 0.9 * sfxStretch;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.06 * sfxStretch);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // White noise buffer
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize); // quick decay
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Slight filtering for watery feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(0.7, now);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  };

  const playClap = () => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const makeBurst = (startOffset: number) => {
      const duration = 0.28 * sfxStretch;
      const start = now + startOffset;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.04 * sfxStretch);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      // Noise source
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass for clap
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1500, start);
      bp.Q.setValueAtTime(1.2, start);

      noise.connect(bp);
      bp.connect(gain);
      gain.connect(ctx.destination);
      noise.start(start);
      noise.stop(start + duration);
    };

    // 3 slower bursts to simulate clapping
    makeBurst(0);
    makeBurst(0.12 * sfxStretch);
    makeBurst(0.24 * sfxStretch);
  };

  const resetVocabRun = () => {
    setCurrentIndex(0);
    setGameOver(false);
    setStartTime(Date.now());
    setEndTime(null);
    setFrogLevel(-1);
    setFrogXPct(50);
    setFrogLeftPx(null);
    setRevealedRows(new Set());
  };

  const total = config?.questions?.length || 0;
  const finished = currentIndex >= total;
  const [reportedComplete, setReportedComplete] = useState(false);

  useEffect(() => {
    if (startTime === null) setStartTime(Date.now());
  }, [startTime]);

  // Notify parent on success once
  useEffect(() => {
    if (finished && !gameOver && !reportedComplete) {
      setReportedComplete(true);
      onComplete?.(100, true);
    }
  }, [finished, gameOver, reportedComplete, onComplete]);

  if (!config || !Array.isArray(config.questions) || config.questions.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid game configuration</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (optionIndex: number, target?: HTMLElement) => {
    if (finished || gameOver) return;
    const isCorrect = optionIndex === config.questions[currentIndex].correctIndex;
    setRevealedRows((prev) => new Set(prev).add(currentIndex));
    if (isCorrect) {
      const isFinal = currentIndex + 1 >= total;
      if (isFinal) playClap(); else playChime();
      // place frog on the row that was just answered (currentIndex)
      setFrogLevel(() => currentIndex);
      setCurrentIndex((prev) => prev + 1);
      if (isFinal) {
        setEndTime(Date.now());
      }
      // keep frogXPct aligned to chosen pad column (0,50,100)
      setFrogXPct(optionIndex === 0 ? 16 : optionIndex === 1 ? 50 : 84);
      // Pixel-exakte Zentrierung relativ zum Spielfeld
      if (target && fieldRef.current) {
        const btnRect = target.getBoundingClientRect();
        const fieldRect = fieldRef.current.getBoundingClientRect();
        const center = btnRect.left + btnRect.width / 2;
        setFrogLeftPx(center - fieldRect.left);
      }
    } else {
      playSplash();
      setGameOver(true);
      setEndTime(Date.now());
    }
  };

  const durationSec = startTime && endTime ? Math.round((endTime - startTime) / 1000) : null;

  // Layout constants
  const padHeight = 90; // px between levels (bigger pads)
  const beachHeight = 110; // px (slightly taller beach)
  const fieldHeight = Math.max(500, total * padHeight + beachHeight + 30);

  const question = config.questions[Math.min(currentIndex, total - 1)];

  return (
    <>
      <div
        className="relative w-full"
        ref={fieldRef}
        style={{
          height: fieldHeight,
          background: 'linear-gradient(180deg, #6ecbff 0%, #8fd3fe 35%, #bfe9ff 70%, #e6f7ff 100%)'
        }}
      >
      {/* Floating question near active lily pad row (inside field for correct positioning) */}
      {!finished && !gameOver && (
        <div
          className="pointer-events-none select-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            // Start unten (über der ersten Antwortreihe) und wandere mit jeder Reihe nach oben
            bottom: `${Math.max(0, currentIndex) * padHeight + 104}px`,
            zIndex: 3,
          }}
        >
          <div className="mx-auto max-w-2xl w-[92%] sm:w-[70%]">
            <div className="bg-white/95 px-3 sm:px-4 py-2 rounded shadow text-center text-sm sm:text-base border border-gray-200">
              {question?.question}
            </div>
          </div>
        </div>
      )}

      {/* Water background */}
      <div
        className="absolute inset-0 water-animated"
        style={{
          zIndex: 0,
          background: 'linear-gradient(180deg, #6ecbff 0%, #8fd3fe 35%, #bfe9ff 70%, #e6f7ff 100%)'
        }}
      />

      {/* Beach at top */}
      <div className="absolute left-0 right-0" style={{ top: 16, height: beachHeight, zIndex: 2 }}>
        <div className="relative w-full h-full bg-yellow-200 rounded-b-xl flex items-center justify-center border-b border-yellow-300 overflow-hidden">
          {/* Parasol decoration */}
          <div className="absolute right-3 bottom-1 opacity-90 select-none pointer-events-none" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              {/* pole */}
              <rect x="30" y="18" width="4" height="38" fill="#7c3f00" />
              {/* canopy */}
              <path d="M8 20 C20 6, 44 6, 56 20 L8 20 Z" fill="#ef4444" />
              <path d="M8 20 C16 12, 24 12, 32 20 L8 20 Z" fill="#fde68a" opacity="0.9" />
              <path d="M32 20 C40 12, 48 12, 56 20 L32 20 Z" fill="#fde68a" opacity="0.9" />
              {/* shadow base */}
              <ellipse cx="32" cy="58" rx="12" ry="3" fill="#d97706" opacity="0.25" />
            </svg>
          </div>
          {/* Beachball */}
          <div className="absolute left-3 bottom-3 opacity-95 select-none pointer-events-none" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="19" fill="#ffffff" stroke="#0f172a" strokeWidth="0.5" opacity="0.15" />
              <path d="M20 20 L20 1 A19 19 0 0 1 36.5 11 Z" fill="#3b82f6" />
              <path d="M20 20 L36.5 11 A19 19 0 0 1 31 36 Z" fill="#ef4444" />
              <path d="M20 20 L31 36 A19 19 0 0 1 4 28 Z" fill="#22c55e" />
              <path d="M20 20 L4 28 A19 19 0 0 1 20 1 Z" fill="#f59e0b" />
              <circle cx="20" cy="20" r="3.2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.5" />
            </svg>
          </div>
          {/* Beach towels */}
          <div className="absolute left-14 bottom-2 rotate-2 opacity-95 select-none pointer-events-none z-0" aria-hidden="true">
            <svg width="72" height="24" viewBox="0 0 72 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="70" height="22" rx="3" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1" />
              <rect x="6" y="1" width="6" height="22" fill="#bfdbfe" />
              <rect x="20" y="1" width="6" height="22" fill="#bfdbfe" />
              <rect x="34" y="1" width="6" height="22" fill="#bfdbfe" />
              <rect x="48" y="1" width="6" height="22" fill="#bfdbfe" />
              <rect x="62" y="1" width="6" height="22" fill="#bfdbfe" />
            </svg>
          </div>
          <div className="absolute left-36 bottom-3 -rotate-3 opacity-95 select-none pointer-events-none z-0" aria-hidden="true">
            <svg width="72" height="24" viewBox="0 0 72 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="70" height="22" rx="3" fill="#fecaca" stroke="#b91c1c" strokeWidth="1" />
              <rect x="6" y="1" width="6" height="22" fill="#fee2e2" />
              <rect x="20" y="1" width="6" height="22" fill="#fee2e2" />
              <rect x="34" y="1" width="6" height="22" fill="#fee2e2" />
              <rect x="48" y="1" width="6" height="22" fill="#fee2e2" />
              <rect x="62" y="1" width="6" height="22" fill="#fee2e2" />
            </svg>
          </div>
          {finished && !gameOver ? (
            <div className="relative z-10 text-center">
              <Trophy className="h-10 w-10 text-yellow-700 mx-auto mb-1" />
              <div className="font-semibold">Beach reached!</div>
              {durationSec !== null && <div className="text-sm text-gray-700">Time: {durationSec}s</div>}
            </div>
          ) : (
            <div className="relative z-10 text-base md:text-lg text-gray-700 font-medium">reach the Beach</div>
          )}
        </div>
      </div>

      {/* Lilypads (three per level) */}
      <div className="absolute left-0 right-0" style={{ bottom: 12, top: beachHeight - 18, zIndex: 1 }}>
        {Array.from({ length: total }).map((_, i) => {
          const y = i * padHeight; // build from bottom upwards towards the beach
          const isCurrent = i === currentIndex;
          const isRevealed = revealedRows.has(i);
          const opts = config.questions[i]?.options || ['', '', ''];
          return (
            <div key={i} className="absolute left-0 right-0" style={{ bottom: y }}>
              <div className="mx-auto max-w-4xl grid grid-cols-3 gap-5 px-6">
                {[0,1,2].map((col) => {
                  const isCorrect = col === (config.questions[i]?.correctIndex ?? -1);
                  const base = 'h-20 md:h-24 rounded-full flex items-center justify-center text-sm md:text-base font-semibold transition-colors shadow-lg';
                  const color = isRevealed
                    ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                    : (isCurrent ? 'bg-green-300 hover:bg-green-400 cursor-pointer' : 'bg-green-100 text-gray-500');
                  const label = isCurrent ? (opts[col] || '') : '';
                  return (
                    <button
                      key={col}
                      className={`${base} ${color}`}
                      onClick={(e) => isCurrent && handleAnswer(col, e.currentTarget)}
                      disabled={!isCurrent}
                    >
                      <span className={`${finished && i === total - 1 ? 'opacity-0' : ''} px-3 text-center leading-snug whitespace-normal break-words`}>{label}</span>
                      {isRevealed && isCorrect && (
                        <Check className="h-4 w-4 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Frog */}
      {!gameOver && (
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            left: frogLeftPx != null ? `${frogLeftPx}px` : `${frogXPct}%`,
            bottom: 16 + Math.max(frogLevel, -1) * padHeight + Math.floor(padHeight / 2) - 36,
            zIndex: 3,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="w-12 h-12 md:w-16 md:h-16">
            {/* Simple frog SVG icon */}
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="frogGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
              </defs>
              <circle cx="32" cy="36" r="18" fill="url(#frogGrad)" stroke="#065f46" strokeWidth="2" />
              <circle cx="24" cy="24" r="8" fill="#10b981" stroke="#065f46" strokeWidth="2" />
              <circle cx="40" cy="24" r="8" fill="#10b981" stroke="#065f46" strokeWidth="2" />
              <circle cx="24" cy="24" r="3" fill="#111827" />
              <circle cx="40" cy="24" r="3" fill="#111827" />
              <path d="M24 42 C32 48, 32 48, 40 42" stroke="#064e3b" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/95 backdrop-blur rounded-lg p-6 text-center shadow space-y-3">
            <X className="h-10 w-10 text-red-600 mx-auto" />
            <div className="font-semibold">Game Over</div>
            {durationSec !== null && <div className="text-sm text-gray-700">Time: {durationSec}s</div>}
            <div>
              <Button onClick={resetVocabRun} className="bg-blue-600 hover:bg-blue-700 text-white">
                Try again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}