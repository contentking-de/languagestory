'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Trophy, RotateCcw, BookOpen } from 'lucide-react';

interface Exercise {
  type: 'fill-in-the-blank' | 'transformation' | 'error-correction' | string;
  instruction: string;
  question: string;
  correct_answer: string;
  explanation?: string;
  difficulty_level?: number;
}

interface InlineGrammarProps {
  topicId: number;
  title: string;
  exercises: Exercise[];
  onComplete: (score: number, passed: boolean) => void;
  onNext: () => void;
}

export default function InlineGrammar({ topicId, title, exercises, onComplete, onNext }: InlineGrammarProps) {
  const [answers, setAnswers] = useState<string[]>(Array(exercises.length).fill(''));
  const [checked, setChecked] = useState<boolean[]>(Array(exercises.length).fill(false));
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setAnswers(Array(exercises.length).fill(''));
    setChecked(Array(exercises.length).fill(false));
    setIsCompleted(false);
    setScore(0);
  }, [topicId]);

  const total = exercises.length || 0;
  const numCorrect = useMemo(() => {
    let count = 0;
    exercises.forEach((ex, i) => {
      const a = (answers[i] || '').trim();
      if (!a) return;
      const expected = (ex.correct_answer || '').trim();
      if (!expected) return;
      if (normalize(a) === normalize(expected)) count += 1;
    });
    return count;
  }, [answers, exercises]);

  function normalize(s: string): string {
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function handleSubmit() {
    const percent = total > 0 ? Math.round((numCorrect / total) * 100) : 0;
    setScore(percent);
    setChecked(exercises.map(() => true));
    setIsCompleted(true);
    onComplete(percent, percent >= 70);
  }

  function handleReset() {
    setAnswers(Array(exercises.length).fill(''));
    setChecked(Array(exercises.length).fill(false));
    setIsCompleted(false);
    setScore(0);
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title || 'Grammar Exercises'}
          {isCompleted && (
            <Badge className={score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {score}%
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercises.map((ex, idx) => {
          const expected = ex.correct_answer || '';
          const given = answers[idx] || '';
          const isCorrect = normalize(given) === normalize(expected);
          return (
            <Card key={idx}>
              <CardContent className="space-y-2 p-4">
                <div className="text-xs text-gray-500">{ex.type}</div>
                <div className="font-medium">{ex.instruction}</div>
                <div className="text-sm text-gray-700">{ex.question}</div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Your answer"
                    value={answers[idx]}
                    onChange={(e) => {
                      const next = [...answers];
                      next[idx] = e.target.value;
                      setAnswers(next);
                    }}
                    disabled={isCompleted}
                  />
                  {checked[idx] && (
                    isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )
                  )}
                </div>
                {checked[idx] && !isCorrect && (
                  <div className="text-sm text-gray-600">Correct: {expected}</div>
                )}
                {ex.explanation && (
                  <div className="text-xs text-gray-500">Hint: {ex.explanation}</div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {!isCompleted ? (
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>
              <Trophy className="h-4 w-4 mr-1" /> Check Answers
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" /> Try Again
            </Button>
            <Button onClick={onNext}>Next</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
