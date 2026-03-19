'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Loader2, Sparkles, Trophy, RotateCcw, CheckCircle, AlertCircle,
  Play, ChevronLeft, Settings2, BookOpen, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

type Language = 'french' | 'german' | 'spanish';

interface Exercise {
  topicId: number;
  topicTitle: string;
  lessonTitle: string | null;
  type: string;
  instruction: string;
  question: string;
  correct_answer: string;
  explanation: string;
  options?: string[];
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

function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

export function GrammarPracticeClient() {
  // Setup state
  const [language, setLanguage] = useState<Language>('french');
  const [lessonId, setLessonId] = useState('all');
  const [exerciseCount, setExerciseCount] = useState('5');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exercise state
  const [answers, setAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredLessons = useMemo(() => {
    return lessons.filter(l => l.course_language === language);
  }, [lessons, language]);

  useEffect(() => {
    setLessonId('all');
  }, [language]);

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

  const startPractice = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        language,
        count: exerciseCount,
      });
      if (lessonId !== 'all') params.set('lessonId', lessonId);

      const res = await fetch(`/api/grammar/practice?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load exercises');
        return;
      }

      if (data.exercises.length === 0) {
        setError('No grammar exercises found for these filters. Try different settings.');
        return;
      }

      setExercises(data.exercises);
      setAnswers(Array(data.exercises.length).fill(''));
      setChecked(false);
      setScore(0);
      setCurrentIndex(0);
      setGameActive(true);
    } catch (e) {
      setError('Failed to start practice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    let correct = 0;
    exercises.forEach((ex, i) => {
      const a = (answers[i] || '').trim();
      if (!a) return;
      if (normalize(a) === normalize(ex.correct_answer)) correct++;
    });
    const percent = exercises.length > 0 ? Math.round((correct / exercises.length) * 100) : 0;
    setScore(percent);
    setChecked(true);
  };

  const handleReset = () => {
    setAnswers(Array(exercises.length).fill(''));
    setChecked(false);
    setScore(0);
    setCurrentIndex(0);
  };

  const playAgain = () => {
    startPractice();
  };

  const backToSetup = () => {
    setGameActive(false);
    setExercises([]);
    setAnswers([]);
    setChecked(false);
    setScore(0);
    setCurrentIndex(0);
  };

  const getScoreStars = () => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    return 1;
  };

  const numCorrect = useMemo(() => {
    if (!checked) return 0;
    let count = 0;
    exercises.forEach((ex, i) => {
      if (normalize(answers[i] || '') === normalize(ex.correct_answer)) count++;
    });
    return count;
  }, [checked, answers, exercises]);

  const gradient = languageGradients[language];
  const langLabel = languageLabels[language];

  // Setup Screen
  if (!gameActive) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/content/grammar">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Grammar
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Grammar Practice</h1>
            <p className="text-muted-foreground">
              Practice grammar exercises from your lessons!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Practice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Lesson (optional)</Label>
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Number of Exercises</Label>
                <Select value={exerciseCount} onValueChange={setExerciseCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 exercises</SelectItem>
                    <SelectItem value="5">5 exercises</SelectItem>
                    <SelectItem value="8">8 exercises</SelectItem>
                    <SelectItem value="10">10 exercises</SelectItem>
                    <SelectItem value="15">15 exercises</SelectItem>
                    <SelectItem value="20">20 exercises</SelectItem>
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
                    Loading Exercises...
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

  // Exercise Screen
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} rounded-t-2xl px-6 py-4 flex items-center justify-between`}>
          <div>
            <p className="text-white/80 text-sm font-medium">Grammar Practice</p>
            <h2 className="text-white text-xl font-bold">
              {langLabel} Exercises
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {exercises.length} exercises
            </Badge>
            {checked && (
              <Badge variant="secondary" className={`border-0 ${score >= 70 ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                {score}%
              </Badge>
            )}
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-2xl p-6">
          {!checked && (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {answers.filter(a => a.trim()).length}
                  </span>/{exercises.length} answered
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(answers.filter(a => a.trim()).length / exercises.length) * 100}%` }}
                />
              </div>
            </>
          )}

          <div className="space-y-4">
            {exercises.map((ex, idx) => {
              const given = answers[idx] || '';
              const isCorrect = checked && normalize(given) === normalize(ex.correct_answer);
              const isWrong = checked && given.trim() && !isCorrect;
              const isUnanswered = checked && !given.trim();

              return (
                <Card key={idx} className={`transition-all ${
                  checked
                    ? isCorrect
                      ? 'border-green-300 bg-green-50/50'
                      : 'border-red-300 bg-red-50/50'
                    : ''
                }`}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {idx + 1}/{exercises.length}
                      </Badge>
                      {ex.lessonTitle && (
                        <span className="text-xs text-gray-400">{ex.lessonTitle}</span>
                      )}
                    </div>

                    <div className="font-medium text-gray-900">{ex.instruction}</div>
                    <div className="text-sm text-gray-700">{ex.question}</div>

                    {ex.type === 'multiple_choice' && Array.isArray(ex.options) && ex.options.length > 0 ? (
                      <div className="space-y-2">
                        {ex.options.map((opt, oi) => {
                          const selected = answers[idx] === opt;
                          const isCorrectOption = checked && normalize(opt) === normalize(ex.correct_answer);

                          return (
                            <button
                              key={oi}
                              type="button"
                              onClick={() => {
                                if (checked) return;
                                const next = [...answers];
                                next[idx] = opt;
                                setAnswers(next);
                              }}
                              disabled={checked}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                                checked
                                  ? isCorrectOption
                                    ? 'border-green-400 bg-green-50 text-green-700'
                                    : selected
                                      ? 'border-red-400 bg-red-50 text-red-700'
                                      : 'border-gray-200 text-gray-500 opacity-60'
                                  : selected
                                    ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-800 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{opt}</span>
                                {checked && isCorrectOption && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {checked && selected && !isCorrectOption && <AlertCircle className="h-4 w-4 text-red-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Type your answer..."
                          value={answers[idx]}
                          onChange={(e) => {
                            if (checked) return;
                            const next = [...answers];
                            next[idx] = e.target.value;
                            setAnswers(next);
                          }}
                          disabled={checked}
                          className={checked
                            ? isCorrect
                              ? 'border-green-400 bg-green-50'
                              : 'border-red-400 bg-red-50'
                            : ''
                          }
                        />
                        {checked && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {checked && (isWrong || isUnanswered) && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                      </div>
                    )}

                    {checked && !isCorrect && (
                      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                        <span className="font-medium">Correct answer:</span> {ex.correct_answer}
                      </div>
                    )}
                    {checked && ex.explanation && (
                      <div className="text-xs text-gray-500 italic">{ex.explanation}</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Results Summary */}
          {checked && (
            <div className="mt-6 flex flex-col items-center py-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {score >= 70 ? 'Well Done!' : 'Keep Practicing!'}
              </h3>

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

              <div className="grid grid-cols-2 gap-4 mb-4 w-full max-w-xs">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{numCorrect}/{exercises.length}</p>
                  <p className="text-xs text-gray-500">Correct</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">{score}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center max-w-sm">
                {score >= 90
                  ? 'Excellent! You have a strong grasp of these grammar concepts.'
                  : score >= 70
                    ? 'Great job! Review the corrections above to strengthen your skills.'
                    : 'Scroll up to review the correct answers and try again!'}
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
          <div className="flex gap-2">
            {!checked ? (
              <Button
                onClick={handleCheck}
                disabled={answers.every(a => !a.trim())}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Check Answers
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={playAgain}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  New Exercises
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
