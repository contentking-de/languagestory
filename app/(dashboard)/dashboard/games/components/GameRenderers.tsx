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
}

export function MemoryGame({ config }: MemoryGameProps) {
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
}

export function HangmanGame({ config }: HangmanGameProps) {
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
}

export function FlashcardsGame({ config }: FlashcardsGameProps) {
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
}

export function WordSearchGame({ config }: WordSearchGameProps) {
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
              }
              
              return newFoundWords;
            });
          }
        });
        
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