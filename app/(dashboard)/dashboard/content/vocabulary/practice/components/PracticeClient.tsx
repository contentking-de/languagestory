'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Sparkles, Trophy, RotateCcw, Check, Clock, ArrowLeft,
  Languages, GraduationCap, Settings2, Play, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

type Language = 'french' | 'german' | 'spanish';

interface VocabWord {
  id: number;
  word: string;
  word_english: string;
  difficulty_level: number;
  lesson_id: number | null;
  lesson_title: string | null;
}

interface Lesson {
  id: number;
  title: string;
  course_id: number;
  course_title: string | null;
  course_language: string | null;
}

const languageLabels: Record<Language, string> = {
  french: 'French',
  german: 'German',
  spanish: 'Spanish',
};

const languageFlags: Record<Language, string> = {
  french: '🇫🇷',
  german: '🇩🇪',
  spanish: '🇪🇸',
};

const languageGradients: Record<Language, string> = {
  spanish: 'from-red-500 to-orange-500',
  german: 'from-gray-800 to-red-600',
  french: 'from-blue-500 to-red-500',
};

const difficultyLabels: Record<string, string> = {
  'all': 'All Levels',
  '1': 'Beginner',
  '2': 'Elementary',
  '3': 'Intermediate',
  '4': 'Upper Intermediate',
  '5': 'Advanced',
};

export function PracticeClient() {
  // Setup state
  const [language, setLanguage] = useState<Language>('french');
  const [filterMode, setFilterMode] = useState<'difficulty' | 'lesson'>('difficulty');
  const [difficulty, setDifficulty] = useState('all');
  const [lessonId, setLessonId] = useState('all');
  const [wordCount, setWordCount] = useState('6');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameWords, setGameWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Word Match game internal state
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

  // Filter lessons by selected language
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => l.course_language === language);
  }, [lessons, language]);

  // Reset lesson selection when language changes
  useEffect(() => {
    setLessonId('all');
    setDifficulty('all');
  }, [language]);

  // Load lessons for dropdown
  useEffect(() => {
    async function loadLessons() {
      try {
        const res = await fetch('/api/lessons?fields=minimal');
        if (res.ok) {
          const data = await res.json();
          setLessons(data);
        }
      } catch (e) {
        console.error('Failed to load lessons:', e);
      } finally {
        setLessonsLoading(false);
      }
    }
    loadLessons();
  }, []);

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

  // Shuffled words and translations for the game
  const { words, translations } = useMemo(() => {
    if (gameWords.length === 0) return { words: [], translations: [] };
    const wordList = gameWords.map((v, i) => ({ id: i, text: v.word }));
    const translationList = gameWords
      .map((v, i) => ({ id: i, text: v.word_english }))
      .sort(() => Math.random() - 0.5);
    return { words: wordList, translations: translationList };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameWords, gameCompleted]);

  const startPractice = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        language,
        count: wordCount,
      });
      if (filterMode === 'difficulty' && difficulty !== 'all') {
        params.set('difficulty', difficulty);
      }
      if (filterMode === 'lesson' && lessonId !== 'all') {
        params.set('lessonId', lessonId);
      }

      const res = await fetch(`/api/vocabulary/practice?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load vocabulary');
        return;
      }

      const validWords = (data.words as VocabWord[]).filter(
        (w) => w.word && w.word.trim() && w.word_english && w.word_english.trim()
      );

      if (validWords.length === 0) {
        setError('No vocabulary found for these filters. Try different settings.');
        return;
      }

      if (validWords.length < 2) {
        setError('At least 2 vocabulary words are needed. Try broader filters.');
        return;
      }

      setGameWords(validWords);
      setGameActive(true);
      resetGameState();
    } catch (e) {
      setError('Failed to start practice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetGameState = () => {
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
  };

  const checkMatch = (wordIdx: number, transIdx: number) => {
    setAttempts((prev) => prev + 1);
    const wordItem = words[wordIdx];
    const translationItem = translations[transIdx];

    if (wordItem.id === translationItem.id) {
      setMatchedPairs((prev) => {
        const newMatched = new Set(prev);
        newMatched.add(wordItem.id);
        if (newMatched.size === gameWords.length) {
          setGameCompleted(true);
        }
        return newMatched;
      });
      setStreak((prev) => {
        const newStreak = prev + 1;
        setBestStreak((best) => Math.max(best, newStreak));
        return newStreak;
      });
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
      }, 400);
    } else {
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
    if (selectedWord !== null) {
      setSelectedTranslation(index);
      checkMatch(selectedWord, index);
    } else {
      setSelectedTranslation(index);
    }
  };

  const playAgain = () => {
    setGameCompleted(true);
    startPractice();
  };

  const backToSetup = () => {
    setGameActive(false);
    setGameWords([]);
    resetGameState();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreStars = () => {
    const accuracy = attempts > 0 ? (gameWords.length / attempts) * 100 : 0;
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  };

  const gradient = languageGradients[language];
  const langLabel = languageLabels[language];

  // Setup Screen
  if (!gameActive) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/content/vocabulary">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Vocabulary
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Practice & Exercise</h1>
            <p className="text-muted-foreground">
              Choose your settings and start matching vocabulary words!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Game Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Language</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="french">{languageFlags.french} French</SelectItem>
                    <SelectItem value="german">{languageFlags.german} German</SelectItem>
                    <SelectItem value="spanish">{languageFlags.spanish} Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Mode Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Filter Vocabulary By</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFilterMode('difficulty'); setLessonId('all'); }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      filterMode === 'difficulty'
                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Difficulty Level
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterMode('lesson'); setDifficulty('all'); }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      filterMode === 'lesson'
                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Languages className="h-4 w-4" />
                    Lesson
                  </button>
                </div>
              </div>

              {/* Difficulty (only when filterMode is 'difficulty') */}
              {filterMode === 'difficulty' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="1">Beginner</SelectItem>
                      <SelectItem value="2">Elementary</SelectItem>
                      <SelectItem value="3">Intermediate</SelectItem>
                      <SelectItem value="4">Upper Intermediate</SelectItem>
                      <SelectItem value="5">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Lesson (only when filterMode is 'lesson') */}
              {filterMode === 'lesson' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Lesson</Label>
                  <Select value={lessonId} onValueChange={setLessonId} disabled={lessonsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={lessonsLoading ? 'Loading...' : 'All Lessons'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Lessons</SelectItem>
                      {filteredLessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id.toString()}>
                          {lesson.course_title ? `${lesson.course_title} – ` : ''}{lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filteredLessons.length === 0 && !lessonsLoading && (
                    <p className="text-sm text-muted-foreground">
                      No lessons found for {langLabel}.
                    </p>
                  )}
                </div>
              )}

              {/* Word Count */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Number of Words</Label>
                <Select value={wordCount} onValueChange={setWordCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 words</SelectItem>
                    <SelectItem value="6">6 words</SelectItem>
                    <SelectItem value="8">8 words</SelectItem>
                    <SelectItem value="10">10 words</SelectItem>
                    <SelectItem value="12">12 words</SelectItem>
                    <SelectItem value="15">15 words</SelectItem>
                    <SelectItem value="20">20 words</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                onClick={startPractice}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading Vocabulary...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Practice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Game Screen
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Game Header */}
        <div className={`bg-gradient-to-r ${gradient} rounded-t-2xl px-6 py-4 flex items-center justify-between`}>
          <div>
            <p className="text-white/80 text-sm font-medium">Practice & Exercise</p>
            <h2 className="text-white text-xl font-bold">
              {langLabel} Word Match
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {gameStarted && (
              <div className="flex items-center gap-2 text-white/90 text-sm bg-white/20 rounded-full px-3 py-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeElapsed)}
              </div>
            )}
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {gameWords.length} pairs
            </Badge>
          </div>
        </div>

        {/* Game Content */}
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-2xl p-6">
          {/* Active Game */}
          {!gameCompleted && (
            <>
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{matchedPairs.size}</span>/{gameWords.length} pairs
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

              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(matchedPairs.size / gameWords.length) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

          {/* Completion Screen */}
          {gameCompleted && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Well Done!</h3>

              <div className="flex gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`text-2xl transition-all duration-300 ${
                      star <= getScoreStars() ? 'text-yellow-400 scale-110' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </div>
                ))}
              </div>

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

              <p className="text-sm text-gray-600 mb-6 text-center max-w-sm">
                {getScoreStars() === 3
                  ? 'Perfect! You matched all words with great accuracy!'
                  : getScoreStars() === 2
                    ? 'Great job! Keep practicing to improve your accuracy.'
                    : 'Nice effort! Try again for a better score.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={backToSetup}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Change Settings
          </Button>
          <Button
            onClick={playAgain}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            {gameCompleted ? 'Play Again' : 'New Words'}
          </Button>
        </div>
      </div>
    </section>
  );
}
