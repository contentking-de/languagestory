'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Trophy, RotateCcw, ArrowRight, Sparkles, Check, Clock } from 'lucide-react';

type Language = 'spanish' | 'german' | 'french';

interface VocabPair {
  word: string;
  translation: string;
}

interface VocabTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

// Sample vocabulary for each language (teaser content)
const vocabularyData: Record<Language, VocabPair[]> = {
  spanish: [
    { word: 'el gato', translation: 'the cat' },
    { word: 'la casa', translation: 'the house' },
    { word: 'el libro', translation: 'the book' },
    { word: 'la playa', translation: 'the beach' },
    { word: 'el perro', translation: 'the dog' },
    { word: 'la comida', translation: 'the food' },
    { word: 'el agua', translation: 'the water' },
    { word: 'la escuela', translation: 'the school' },
    { word: 'el sol', translation: 'the sun' },
    { word: 'la luna', translation: 'the moon' },
    { word: 'el amigo', translation: 'the friend' },
    { word: 'la familia', translation: 'the family' },
  ],
  german: [
    { word: 'die Katze', translation: 'the cat' },
    { word: 'das Haus', translation: 'the house' },
    { word: 'das Buch', translation: 'the book' },
    { word: 'der Strand', translation: 'the beach' },
    { word: 'der Hund', translation: 'the dog' },
    { word: 'das Essen', translation: 'the food' },
    { word: 'das Wasser', translation: 'the water' },
    { word: 'die Schule', translation: 'the school' },
    { word: 'die Sonne', translation: 'the sun' },
    { word: 'der Mond', translation: 'the moon' },
    { word: 'der Freund', translation: 'the friend' },
    { word: 'die Familie', translation: 'the family' },
  ],
  french: [
    { word: 'le chat', translation: 'the cat' },
    { word: 'la maison', translation: 'the house' },
    { word: 'le livre', translation: 'the book' },
    { word: 'la plage', translation: 'the beach' },
    { word: 'le chien', translation: 'the dog' },
    { word: 'la nourriture', translation: 'the food' },
    { word: "l'eau", translation: 'the water' },
    { word: "l'école", translation: 'the school' },
    { word: 'le soleil', translation: 'the sun' },
    { word: 'la lune', translation: 'the moon' },
    { word: "l'ami", translation: 'the friend' },
    { word: 'la famille', translation: 'the family' },
  ],
};

const languageLabels: Record<Language, string> = {
  spanish: 'Spanish',
  german: 'German',
  french: 'French',
};

const languageGradients: Record<Language, string> = {
  spanish: 'from-red-500 to-orange-500',
  german: 'from-gray-800 to-red-600',
  french: 'from-blue-500 to-red-500',
};

const GAME_SIZE = 6; // Number of pairs per round

export function VocabTeaserModal({ isOpen, onClose, language }: VocabTeaserModalProps) {
  // Game state
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ word: number; translation: number } | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Pick random vocabulary pairs and shuffle translations
  const { words, translations, pairMap } = useMemo(() => {
    const allVocab = vocabularyData[language];
    // Shuffle and pick GAME_SIZE pairs
    const shuffled = [...allVocab].sort(() => Math.random() - 0.5).slice(0, GAME_SIZE);
    const wordList = shuffled.map((v, i) => ({ id: i, text: v.word }));
    // Shuffle translations independently
    const translationList = shuffled
      .map((v, i) => ({ id: i, text: v.translation }))
      .sort(() => Math.random() - 0.5);
    // Create mapping: wordId -> translationId in the shuffled translations array
    const map = new Map<number, number>();
    wordList.forEach((w) => {
      const tIdx = translationList.findIndex((t) => t.id === w.id);
      map.set(w.id, tIdx);
    });
    return { words: wordList, translations: translationList, pairMap: map };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, gameCompleted]); // re-shuffle on game reset

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Check for a match given a word index and translation index
  const checkMatch = (wordIdx: number, transIdx: number) => {
    setAttempts((prev) => prev + 1);

    const wordItem = words[wordIdx];
    const translationItem = translations[transIdx];

    if (wordItem.id === translationItem.id) {
      // Correct match!
      setMatchedPairs((prev) => {
        const newMatched = new Set(prev);
        newMatched.add(wordItem.id);
        // Check for game completion
        if (newMatched.size === GAME_SIZE) {
          setGameCompleted(true);
        }
        return newMatched;
      });
      setStreak((prev) => {
        const newStreak = prev + 1;
        setBestStreak((best) => Math.max(best, newStreak));
        return newStreak;
      });

      // Clear selections after a brief highlight
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
      }, 400);
    } else {
      // Wrong match
      setStreak(0);
      setWrongPair({ word: wordIdx, translation: transIdx });
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
        setWrongPair(null);
      }, 800);
    }
  };

  const handleWordClick = (index: number) => {
    if (matchedPairs.has(words[index].id)) return;
    if (wrongPair) return;
    if (!gameStarted) setGameStarted(true);
    // If a translation is already selected, check for match immediately
    if (selectedTranslation !== null) {
      setSelectedWord(index);
      checkMatch(index, selectedTranslation);
    } else {
      setSelectedWord(index);
    }
  };

  const handleTranslationClick = (index: number) => {
    if (matchedPairs.has(translations[index].id)) return;
    if (wrongPair) return;
    if (!gameStarted) setGameStarted(true);
    // If a word is already selected, check for match immediately
    if (selectedWord !== null) {
      setSelectedTranslation(index);
      checkMatch(selectedWord, index);
    } else {
      setSelectedTranslation(index);
    }
  };

  const resetGame = () => {
    setSelectedWord(null);
    setSelectedTranslation(null);
    setMatchedPairs(new Set());
    setWrongPair(null);
    setGameCompleted(false);
    setAttempts(0);
    setStreak(0);
    setBestStreak(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setShowIntro(false);
  };

  const startGame = () => {
    setShowIntro(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreStars = () => {
    const accuracy = attempts > 0 ? (GAME_SIZE / attempts) * 100 : 0;
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  };

  if (!isOpen) return null;

  const gradient = languageGradients[language];
  const langLabel = languageLabels[language];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
          <div>
            <p className="text-white/80 text-sm font-medium">Vocabulary Game</p>
            <h2 className="text-white text-xl font-bold">
              {langLabel} Word Match
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {gameStarted && !showIntro && (
              <div className="flex items-center gap-2 text-white/90 text-sm bg-white/20 rounded-full px-3 py-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeElapsed)}
              </div>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Intro screen */}
          {showIntro && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Match the Words!</h3>
              <p className="text-gray-600 text-center max-w-md mb-2">
                Match each <strong>{langLabel}</strong> word on the left with its English translation on the right. 
              </p>
              <p className="text-gray-500 text-center text-sm max-w-md mb-8">
                Click a word, then click its translation to make a pair. 
                Try to match all {GAME_SIZE} pairs as fast as you can!
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25 flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Start Game
              </button>
            </div>
          )}

          {/* Game board */}
          {!showIntro && !gameCompleted && (
            <>
              {/* Stats bar */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{matchedPairs.size}</span>/{GAME_SIZE} pairs
                  </div>
                  <div className="text-sm text-gray-500">
                    Attempts: <span className="font-semibold text-gray-700">{attempts}</span>
                  </div>
                </div>
                {streak > 1 && (
                  <div className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full animate-pulse">
                    {streak} streak!
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(matchedPairs.size / GAME_SIZE) * 100}%` }}
                />
              </div>

              {/* Matching columns */}
              <div className="grid grid-cols-2 gap-4">
                {/* Words column (target language) */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
                    {langLabel}
                  </p>
                  {words.map((word, index) => {
                    const isMatched = matchedPairs.has(word.id);
                    const isSelected = selectedWord === index;
                    const isWrong = wrongPair?.word === index;

                    return (
                      <button
                        key={`word-${word.id}`}
                        onClick={() => handleWordClick(index)}
                        disabled={isMatched}
                        className={`w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border-2 ${
                          isMatched
                            ? 'bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default'
                            : isWrong
                              ? 'bg-red-50 border-red-400 text-red-700 animate-shake'
                              : isSelected
                                ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-md ring-2 ring-orange-200'
                                : 'bg-white border-gray-200 text-gray-800 hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-sm cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{word.text}</span>
                          {isMatched && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Translations column (English) */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
                    English
                  </p>
                  {translations.map((translation, index) => {
                    const isMatched = matchedPairs.has(translation.id);
                    const isSelected = selectedTranslation === index;
                    const isWrong = wrongPair?.translation === index;

                    return (
                      <button
                        key={`trans-${translation.id}-${index}`}
                        onClick={() => handleTranslationClick(index)}
                        disabled={isMatched}
                        className={`w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border-2 ${
                          isMatched
                            ? 'bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default'
                            : isWrong
                              ? 'bg-red-50 border-red-400 text-red-700 animate-shake'
                              : isSelected
                                ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-md ring-2 ring-blue-200'
                                : 'bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{translation.text}</span>
                          {isMatched && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Completion screen */}
          {gameCompleted && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Well Done!</h3>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`text-2xl transition-all duration-300 ${
                      star <= getScoreStars() ? 'text-yellow-400 scale-110' : 'text-gray-300'
                    }`}
                    style={{ animationDelay: `${star * 200}ms` }}
                  >
                    ★
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-sm">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{formatTime(timeElapsed)}</p>
                  <p className="text-xs text-gray-500">Time</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{attempts}</p>
                  <p className="text-xs text-gray-500">Attempts</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{bestStreak}</p>
                  <p className="text-xs text-gray-500">Best Streak</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 max-w-sm w-full">
                <p className="text-sm text-orange-800 text-center">
                  {getScoreStars() === 3
                    ? 'Amazing! You matched all words perfectly. Sign up to unlock hundreds more vocabulary games!'
                    : getScoreStars() === 2
                      ? 'Great job! Practice makes perfect. Sign up to access our full vocabulary game library!'
                      : 'Nice effort! Sign up to keep practicing and improve your vocabulary skills!'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showIntro && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-gray-50">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              {gameCompleted ? 'Play Again' : 'Restart'}
            </button>
            <a
              href="/sign-up"
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold shadow-lg shadow-orange-500/25"
            >
              Sign Up for Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
