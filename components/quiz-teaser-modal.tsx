'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Trophy, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';

interface GapFillConfig {
  original_text?: string;
  text_content?: string;
  word_bank?: string;
  correct_order?: string;
  num_gaps?: number;
  difficulty?: string;
  allow_hints?: boolean;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string;
  pass_percentage: number;
  time_limit: number;
  max_attempts: number;
  points_value: number;
  is_published: boolean;
  lesson_title?: string;
  course_title?: string;
  course_language?: string;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  correct_answer: string;
  answer_options: string[] | null;
  explanation?: string;
}

interface QuizTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizType: 'true_false' | 'multiple_choice' | 'gap_fill';
}

export function QuizTeaserModal({ isOpen, onClose, quizType }: QuizTeaserModalProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [selectedGap, setSelectedGap] = useState<string | null>(null);
  const [gapFillConfig, setGapFillConfig] = useState<GapFillConfig | null>(null);

  const quizTypeLabels: Record<string, string> = {
    true_false: 'True or False',
    multiple_choice: 'Multiple Choice',
    gap_fill: 'Fill the Gap',
  };

  // Helper: normalize answer_options to always be a string array
  const normalizeAnswerOptions = (options: any): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) return options.map((o: any) => String(o));
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) return parsed.map((o: any) => String(o));
      } catch {
        return options.split(',').map((o: string) => o.trim());
      }
    }
    return [];
  };

  // Helper: compare answers robustly (case-insensitive, trimmed)
  const answersMatch = (userAnswer: string | undefined, correctAnswer: string | undefined): boolean => {
    if (!userAnswer || !correctAnswer) return false;
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  // Derive correct answers by comparing original text with gap text.
  // This is the most reliable method since it doesn't depend on stored correct_order.
  const deriveCorrectAnswers = (originalText: string, gapText: string): string[] => {
    const textParts = gapText.split('[BLANK]');
    const answers: string[] = [];
    let pos = 0;

    for (let i = 0; i < textParts.length - 1; i++) {
      const part = textParts[i];
      // Find where this non-gap part starts in the original text
      const partStart = originalText.indexOf(part, pos);
      if (partStart === -1) return []; // mismatch, bail out
      pos = partStart + part.length;

      // The next non-gap part tells us where the gap word ends
      const nextPart = textParts[i + 1];
      let nextPartStart: number;
      if (nextPart === '') {
        nextPartStart = originalText.length;
      } else {
        nextPartStart = originalText.indexOf(nextPart, pos);
        if (nextPartStart === -1) return []; // mismatch, bail out
      }

      // The text between these positions is the correct answer for this gap
      const answer = originalText.substring(pos, nextPartStart).trim();
      answers.push(answer);
      pos = nextPartStart;
    }

    return answers;
  };

  // Get the correct answers for a fill_blank question, using the best source available.
  const getCorrectAnswersForGap = (question: Question): string[] => {
    // Strategy 1: Derive from original_text vs gap text (most reliable)
    if (gapFillConfig?.original_text && question.question_text.includes('[BLANK]')) {
      const derived = deriveCorrectAnswers(gapFillConfig.original_text, question.question_text);
      if (derived.length > 0) {
        return derived;
      }
    }

    // Strategy 2: Use correct_order from quiz config
    if (gapFillConfig?.correct_order) {
      const fromConfig = gapFillConfig.correct_order.split('|').map((w) => w.trim()).filter(Boolean);
      if (fromConfig.length > 0) {
        return fromConfig;
      }
    }

    // Strategy 3: Fall back to question's correct_answer field
    if (question.correct_answer) {
      return question.correct_answer.split('|').map((w) => w.trim()).filter(Boolean);
    }

    return [];
  };

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setGapAnswers({});
    setShowResults(false);
    setSelectedGap(null);
    setGapFillConfig(null);

    try {
      // Fetch all quizzes and find a published one of the right type
      const response = await fetch('/api/quizzes');
      if (!response.ok) throw new Error('Failed to fetch quizzes');

      const allQuizzes: Quiz[] = await response.json();
      const matching = allQuizzes.filter(
        (q) => q.quiz_type === quizType && q.is_published
      );

      if (matching.length === 0) {
        setError(`No published ${quizTypeLabels[quizType]} quizzes available yet. Check back soon!`);
        setLoading(false);
        return;
      }

      // Pick a random quiz
      const selected = matching[Math.floor(Math.random() * matching.length)];

      // Parse description JSON if needed + extract gap_fill config
      let processedQuiz = { ...selected };
      if (selected.description && typeof selected.description === 'string') {
        try {
          const parsed = JSON.parse(selected.description);
          if (parsed.description) {
            processedQuiz.description = parsed.description;
          }
          // Extract gap_fill config for deriving correct answers
          if (parsed.config?.gap_fill) {
            setGapFillConfig(parsed.config.gap_fill);
          }
        } catch {
          // description is already plain string
        }
      }

      setQuiz(processedQuiz);

      // Fetch questions for this quiz
      const questionsResponse = await fetch(`/api/quizzes/${selected.id}/questions`);
      if (!questionsResponse.ok) throw new Error('Failed to fetch questions');

      const questionsData = await questionsResponse.json();
      // Normalize answer_options for each question
      const normalizedQuestions: Question[] = questionsData.map((q: any) => ({
        ...q,
        answer_options: normalizeAnswerOptions(q.answer_options),
      }));
      setQuestions(normalizedQuestions);
    } catch (err) {
      console.error('Error loading teaser quiz:', err);
      setError('Could not load quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [quizType]);

  useEffect(() => {
    if (isOpen) {
      fetchQuiz();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, fetchQuiz]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // --- Answer handling ---
  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleGapAnswerChange = (gapKey: string, value: string) => {
    setGapAnswers((prev) => ({ ...prev, [gapKey]: value }));
  };

  const handleDragStart = (e: React.DragEvent, word: string) => {
    setDraggedWord(word);
    e.dataTransfer.setData('text/plain', word);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, gapKey: string) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (word) {
      handleGapAnswerChange(gapKey, word);
    }
    setDraggedWord(null);
  };

  // --- Score calculation ---
  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;

      if (question.question_type === 'fill_blank') {
        const correctAnswers = getCorrectAnswersForGap(question);
        const gaps = question.question_text.match(/\[BLANK\]/g) || [];
        let correctGaps = 0;

        gaps.forEach((_, index) => {
          const gapKey = `${question.id}-gap-${index}`;
          const userAnswer = gapAnswers[gapKey] || '';
          const correct = correctAnswers[index] || '';
          if (answersMatch(userAnswer, correct)) {
            correctGaps++;
          }
        });

        if (gaps.length > 0) {
          earnedPoints += (correctGaps / gaps.length) * question.points;
        }
      } else {
        // Works for both true_false and multiple_choice
        const userAnswer = userAnswers[question.id];
        if (answersMatch(userAnswer, question.correct_answer)) {
          earnedPoints += question.points;
        }
      }
    });

    return {
      totalPoints,
      earnedPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
    };
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setGapAnswers({});
    setShowResults(false);
    setSelectedGap(null);
  };

  const score = showResults ? calculateScore() : null;
  const passed = score && quiz ? score.percentage >= quiz.pass_percentage : false;

  // --- Rendering helpers ---

  const renderMultipleChoiceQuestion = (question: Question, index: number) => {
    const userAnswer = userAnswers[question.id];
    const isCorrect = answersMatch(userAnswer, question.correct_answer);

    return (
      <div
        key={question.id}
        className={`p-4 rounded-lg border-2 transition-colors ${
          showResults
            ? isCorrect
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
            : 'border-gray-200 bg-white'
        }`}
      >
        <h4 className="font-semibold text-gray-900 mb-3">
          {index + 1}. {question.question_text}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({question.points} {question.points === 1 ? 'point' : 'points'})
          </span>
        </h4>

        <div className="space-y-2">
          {question.answer_options?.map((option, optionIndex) => {
            const isSelected = userAnswer === option;
            const isCorrectOption = answersMatch(option, question.correct_answer);

            return (
              <label
                key={optionIndex}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  showResults
                    ? isCorrectOption
                      ? 'bg-green-100 border-green-400'
                      : isSelected && !isCorrectOption
                        ? 'bg-red-100 border-red-400'
                        : 'bg-gray-50 border-gray-200'
                    : isSelected
                      ? 'bg-orange-50 border-orange-400'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name={`teaser-question-${question.id}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleAnswerChange(question.id, option)}
                  disabled={showResults}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                    showResults
                      ? isCorrectOption
                        ? 'border-green-500 bg-green-500'
                        : isSelected && !isCorrectOption
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                      : isSelected
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                  }`}
                />
                <span
                  className={
                    showResults && isCorrectOption ? 'font-medium text-green-700' : ''
                  }
                >
                  {option}
                </span>
                {showResults && isCorrectOption && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto flex-shrink-0" />
                )}
                {showResults && isSelected && !isCorrectOption && (
                  <AlertCircle className="h-4 w-4 text-red-600 ml-auto flex-shrink-0" />
                )}
              </label>
            );
          })}
        </div>

        {showResults && question.explanation && (
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <p className="text-sm text-blue-700">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTrueFalseQuestion = (question: Question, index: number) => {
    const userAnswer = userAnswers[question.id];
    const isCorrect = answersMatch(userAnswer, question.correct_answer);

    // Options with lowercase value (matching DB format) and display label
    const tfOptions = [
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' },
    ];

    return (
      <div
        key={question.id}
        className={`p-4 rounded-lg border-2 transition-colors ${
          showResults
            ? isCorrect
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
            : 'border-gray-200 bg-white'
        }`}
      >
        <h4 className="font-semibold text-gray-900 mb-3">
          {index + 1}. {question.question_text}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({question.points} {question.points === 1 ? 'point' : 'points'})
          </span>
        </h4>

        <div className="flex gap-4">
          {tfOptions.map(({ value, label }) => {
            const isSelected = userAnswer === value;
            const isCorrectOption = answersMatch(value, question.correct_answer);

            return (
              <label
                key={value}
                className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors font-medium ${
                  showResults
                    ? isCorrectOption
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : isSelected && !isCorrectOption
                        ? 'bg-red-100 border-red-400 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    : isSelected
                      ? 'bg-orange-50 border-orange-400 text-orange-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name={`teaser-question-${question.id}`}
                  value={value}
                  checked={isSelected}
                  onChange={() => handleAnswerChange(question.id, value)}
                  disabled={showResults}
                  className="sr-only"
                />
                {label}
                {showResults && isCorrectOption && (
                  <CheckCircle className="h-4 w-4 ml-2 flex-shrink-0" />
                )}
              </label>
            );
          })}
        </div>

        {showResults && question.explanation && (
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <p className="text-sm text-blue-700">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderFillBlankQuestion = (question: Question, index: number) => {
    const correctAnswers = getCorrectAnswersForGap(question);
    const words: string[] = question.answer_options || [];
    const textParts = question.question_text.split('[BLANK]');
    const gapCount = textParts.length - 1;

    // Collect which words are already placed in gaps (to dim them in the word bank)
    const placedWords: Record<string, number> = {};
    for (let i = 0; i < gapCount; i++) {
      const gapKey = `${question.id}-gap-${i}`;
      const w = gapAnswers[gapKey];
      if (w) {
        placedWords[w] = (placedWords[w] || 0) + 1;
      }
    }

    // Handle clicking a word from the word bank
    const handleWordClick = (word: string) => {
      if (showResults) return;

      if (selectedGap) {
        // A gap is selected → fill it with this word
        // If the gap already had a word, it will be replaced
        handleGapAnswerChange(selectedGap, word);
        setSelectedGap(null);
      } else {
        // No gap selected → find the first empty gap
        for (let i = 0; i < gapCount; i++) {
          const gapKey = `${question.id}-gap-${i}`;
          if (!gapAnswers[gapKey]) {
            handleGapAnswerChange(gapKey, word);
            break;
          }
        }
      }
    };

    // Handle clicking on a gap
    const handleGapClick = (gapKey: string) => {
      if (showResults) return;

      if (gapAnswers[gapKey]) {
        // Gap is filled → clear it
        setGapAnswers((prev) => {
          const next = { ...prev };
          delete next[gapKey];
          return next;
        });
        setSelectedGap(null);
      } else {
        // Gap is empty → select it (or deselect if already selected)
        setSelectedGap((prev) => (prev === gapKey ? null : gapKey));
      }
    };

    return (
      <div key={question.id} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
        <h4 className="font-semibold text-gray-900 mb-3">
          {index + 1}. Fill in the gaps
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({question.points} {question.points === 1 ? 'point' : 'points'})
          </span>
        </h4>

        {/* Text with gaps */}
        <div className="mb-4 text-gray-700 leading-relaxed text-lg">
          {textParts.map((textPart, partIndex) => (
            <span key={partIndex}>
              {textPart}
              {partIndex < textParts.length - 1 && (() => {
                const gapKey = `${question.id}-gap-${partIndex}`;
                const userAnswer = gapAnswers[gapKey];
                const correctAnswer = correctAnswers[partIndex] || '';
                const isGapCorrect = answersMatch(userAnswer, correctAnswer);
                const isSelected = selectedGap === gapKey;

                return (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => handleGapClick(gapKey)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleGapClick(gapKey);
                    }}
                    className={`inline-block min-w-[80px] px-2 py-1 mx-1 border-b-2 font-medium text-center transition-all cursor-pointer rounded-sm ${
                      showResults
                        ? isGapCorrect
                          ? 'border-green-500 text-green-700 bg-green-50'
                          : 'border-red-500 text-red-700 bg-red-50'
                        : isSelected
                          ? 'border-orange-500 bg-orange-100 ring-2 ring-orange-300 text-orange-700'
                          : userAnswer
                            ? 'border-orange-400 text-orange-700 bg-orange-50 hover:bg-orange-100'
                            : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onDrop={(e) => {
                      handleDrop(e, gapKey);
                      setSelectedGap(null);
                    }}
                    onDragOver={handleDragOver}
                  >
                    {showResults && !isGapCorrect ? (
                      <span>
                        <span className="line-through">{userAnswer || '_____'}</span>
                        <span className="text-green-600 ml-1 no-underline text-sm">
                          ({correctAnswer})
                        </span>
                      </span>
                    ) : (
                      userAnswer || '_____'
                    )}
                  </span>
                );
              })()}
            </span>
          ))}
        </div>

        {/* Word bank */}
        {!showResults && words.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Word bank
              {selectedGap
                ? <span className="text-orange-600"> — click a word to place it in the selected gap</span>
                : <span> — click a gap above to select it, then click a word</span>
              }
            </p>
            <div className="flex flex-wrap gap-2">
              {words.map((word: string, wordIndex: number) => {
                // Check how many times this word is used vs how many times it appears in word bank
                const wordCountInBank = words.filter((w) => w === word).length;
                const wordUsedCount = placedWords[word] || 0;
                // Only dim if ALL instances of this word are used
                const isUsed = wordUsedCount >= wordCountInBank;

                return (
                  <span
                    key={wordIndex}
                    draggable={!isUsed}
                    onDragStart={(e) => !isUsed && handleDragStart(e, word)}
                    onClick={() => handleWordClick(word)}
                    className={`px-3 py-1.5 rounded-full cursor-pointer transition-all select-none font-medium text-sm ${
                      isUsed
                        ? 'bg-gray-200 text-gray-400 line-through cursor-pointer'
                        : selectedGap
                          ? 'bg-orange-200 text-orange-900 hover:bg-orange-300 ring-1 ring-orange-300'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click a filled gap to remove its word. You can also drag &amp; drop words into gaps.
              {words.length > gapCount && (
                <span className="block mt-1 text-orange-600 font-medium">
                  Note: The word bank contains {words.length} words but there are only {gapCount} gaps — not all words are needed!
                </span>
              )}
            </p>
          </div>
        )}

        {showResults && question.explanation && (
          <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <p className="text-sm text-blue-700">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderQuestion = (question: Question, index: number) => {
    if (question.question_type === 'multiple_choice') {
      return renderMultipleChoiceQuestion(question, index);
    }
    if (question.question_type === 'true_false') {
      return renderTrueFalseQuestion(question, index);
    }
    if (question.question_type === 'fill_blank') {
      return renderFillBlankQuestion(question, index);
    }
    return null;
  };

  // Check if all questions have been answered
  const allAnswered = questions.every((q) => {
    if (q.question_type === 'fill_blank') {
      const gaps = q.question_text.match(/\[BLANK\]/g) || [];
      return gaps.every((_, i) => gapAnswers[`${q.id}-gap-${i}`]);
    }
    return !!userAnswers[q.id];
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-orange-100 text-sm font-medium">Quiz Preview</p>
            <h2 className="text-white text-xl font-bold">
              {quiz ? quiz.title : quizTypeLabels[quizType]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading quiz...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">{error}</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && quiz && (
            <>
              {/* Quiz description */}
              {quiz.description && !showResults && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{quiz.description}</p>
                  {quiz.course_title && (
                    <p className="text-sm text-gray-500 mt-2">
                      Course: {quiz.course_title}
                      {quiz.course_language && ` · ${quiz.course_language}`}
                    </p>
                  )}
                </div>
              )}

              {/* Results section */}
              {showResults && score && (
                <div
                  className={`mb-6 p-6 rounded-xl border-2 ${
                    passed
                      ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                      : 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {passed ? (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    )}
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          passed ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {passed ? 'Great Job!' : 'Keep Practicing!'}
                      </h3>
                      <p className="text-gray-600">
                        You scored{' '}
                        <span className="font-bold">{score.percentage}%</span>{' '}
                        ({score.earnedPoints}/{score.totalPoints} points)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4 mt-4">
                    <p className="text-gray-700 text-sm">
                      {passed
                        ? 'Excellent! You passed this quiz. Sign up to access more quizzes, track your progress, and continue learning!'
                        : `You need ${quiz.pass_percentage}% to pass. Don't worry — practice makes perfect! Sign up to access all quizzes and track your improvement.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Questions */}
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, index) =>
                    renderQuestion(question, index)
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    This quiz has no questions yet.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && quiz && questions.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-gray-50">
            {showResults ? (
              <>
                <button
                  onClick={resetQuiz}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>
                <a
                  href="/sign-up"
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold shadow-lg shadow-orange-500/25"
                >
                  Sign Up for Free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  {questions.length} question{questions.length !== 1 ? 's' : ''}
                  {!allAnswered && ' — answer all to submit'}
                </p>
                <button
                  onClick={submitQuiz}
                  disabled={!allAnswered}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-colors ${
                    allAnswered
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Submit Quiz
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
