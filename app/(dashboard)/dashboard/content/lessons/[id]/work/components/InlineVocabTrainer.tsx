'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ArrowRight, BookOpen } from 'lucide-react';

export interface LessonVocabularyItem {
  id: number;
  word_english: string;
  word_french?: string;
  word_german?: string;
  word_spanish?: string;
  pronunciation?: string;
  phonetic?: string;
  context_sentence?: string;
  difficulty_level: number;
  word_type?: string;
}

export function InlineVocabTrainer({
  words,
  targetLanguage,
  onComplete,
  onNext,
}: {
  words: LessonVocabularyItem[];
  targetLanguage: 'french' | 'german' | 'spanish' | 'english';
  onComplete: () => void;
  onNext: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const items = useMemo(() => words.filter(Boolean), [words]);
  const total = items.length;
  const current = items[index];

  if (!current || total === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center text-gray-600">No vocabulary assigned to this lesson.</CardContent>
      </Card>
    );
  }

  const translation = (() => {
    if (targetLanguage === 'french') return current.word_french || '';
    if (targetLanguage === 'german') return current.word_german || '';
    if (targetLanguage === 'spanish') return current.word_spanish || '';
    return current.word_english;
  })();
  const englishWord = current.word_english || '';

  const handleReveal = () => setShowAnswer(true);
  const handleNext = () => {
    const next = index + 1;
    if (next < total) {
      setIndex(next);
      setShowAnswer(false);
    } else {
      onComplete();
      onNext();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Vocabulary Trainer
          </span>
          <span className="text-sm text-gray-500">{index + 1} / {total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {targetLanguage === 'german' ? (
          <div className="p-6 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Word (German)</p>
                <p className="text-2xl font-semibold text-gray-900">{translation || '—'}</p>
              </div>
              <Badge variant="outline">Lvl {current.difficulty_level}</Badge>
            </div>
          </div>
        ) : (
          <div className="p-6 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Prompt (English)</p>
                <p className="text-2xl font-semibold text-gray-900">{current.word_english}</p>
                {current.context_sentence && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{current.context_sentence}"</p>
                )}
              </div>
              <Badge variant="outline">Lvl {current.difficulty_level}</Badge>
            </div>
          </div>
        )}

        <div className="p-6 border rounded-lg">
          {targetLanguage === 'german' ? (
            <>
              <p className="text-gray-500 text-sm mb-1">Reveal (English)</p>
              {showAnswer ? (
                <div>
                  <p className="text-xl font-medium text-gray-900">{englishWord || '—'}</p>
                  {current.context_sentence && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{current.context_sentence}"</p>
                  )}
                </div>
              ) : (
                <p className="text-xl text-gray-300 select-none">•••••••</p>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-1">Answer ({targetLanguage})</p>
              {showAnswer ? (
                <p className="text-xl font-medium text-gray-900">{translation || '—'}</p>
              ) : (
                <p className="text-xl text-gray-300 select-none">•••••••</p>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowAnswer(false)} disabled={!showAnswer}>
            <RefreshCw className="h-4 w-4 mr-2" /> Hide
          </Button>
          {!showAnswer ? (
            <Button onClick={handleReveal}>Reveal</Button>
          ) : (
            <Button onClick={handleNext}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default InlineVocabTrainer;


