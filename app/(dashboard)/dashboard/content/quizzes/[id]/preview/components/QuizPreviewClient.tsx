'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { logQuizActivity } from '@/lib/activity-logger';
import { awardPoints } from '@/lib/gamification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Play,
  Clock,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  BookOpen,
  FileQuestion,
  Users
} from 'lucide-react';
import Link from 'next/link';

interface Quiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string;
  pass_percentage: number;
  time_limit: number;
  max_attempts: number;
  points_value: number;
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
  answer_options: any;
  explanation?: string;
}

interface QuizPreviewClientProps {
  userRole: string;
}

export function QuizPreviewClient({ userRole }: QuizPreviewClientProps) {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [gapAnswers, setGapAnswers] = useState<{[key: string]: string}>({});
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      const [quizResponse, questionsResponse] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/questions`)
      ]);

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        
        // Handle both old and new quiz description formats
        let processedQuizData = { ...quizData };
        
        if (quizData.description && typeof quizData.description === 'string') {
          try {
            // Try to parse description as JSON (old format)
            const parsedDescription = JSON.parse(quizData.description);
            if (parsedDescription.description) {
              processedQuizData.description = parsedDescription.description;
            } else if (parsedDescription.config) {
              // If no description, use title or a default
              processedQuizData.description = quizData.title || 'Gap Fill Exercise';
            }
          } catch (e) {
            // Description is already a plain string (new format), keep as is
            processedQuizData.description = quizData.description;
          }
        }
        
        setQuiz(processedQuizData);
      }

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        
        // Process questions data to handle answer_options formatting and get original text
        const processedQuestions = await Promise.all(questionsData.map(async (question: any) => {
          if (question.question_type === 'fill_blank' && question.answer_options) {
            // Ensure answer_options is an array
            if (typeof question.answer_options === 'string') {
              try {
                // Try parsing as JSON array
                question.answer_options = JSON.parse(question.answer_options);
              } catch (e) {
                // If not JSON, split by comma
                question.answer_options = question.answer_options.split(',').map((word: string) => word.trim());
              }
            }
            
            // Get original text from quiz configuration for better validation
            try {
              const quizResponse = await fetch(`/api/quizzes/${quizId}`);
              if (quizResponse.ok) {
                const quizData = await quizResponse.json();
                const parsedDescription = JSON.parse(quizData.description || '{}');
                if (parsedDescription.config?.gap_fill?.original_text) {
                  question.original_text = parsedDescription.config.gap_fill.original_text;
                }
              }
            } catch (e) {
              // Fallback to existing logic
            }
          }
          return question;
        }));
        
        setQuestions(processedQuestions);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleGapAnswerChange = (gapKey: string, value: string) => {
    setGapAnswers(prev => ({
      ...prev,
      [gapKey]: value
    }));
  };

  const handleDragStart = (e: React.DragEvent, word: string) => {
    setDraggedWord(word);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, gapKey: string) => {
    e.preventDefault();
    if (draggedWord) {
      handleGapAnswerChange(gapKey, draggedWord);
      setDraggedWord(null);
    }
  };

  const submitQuiz = async () => {
    try {
      const allAnswers = { ...userAnswers };
      
      // Convert gap answers to question answers
      questions.forEach(question => {
        if (question.question_type === 'fill_blank') {
          const gaps = question.question_text.match(/\[BLANK\]/g) || [];
          const gapAnswersForQuestion = gaps.map((gap, index) => {
            const gapKey = `${question.id}-gap-${index}`;
            return gapAnswers[gapKey] || '';
          }).join('|');
          allAnswers[question.id] = gapAnswersForQuestion;
        }
      });

      setUserAnswers(allAnswers);
      setShowResults(true);
      setQuizCompleted(true);

      // Calculate final score for points awarding
      const finalScore = calculateScore();
      
      // Award points for quiz completion
      try {
        await fetch('/api/student/award-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activity_type: 'COMPLETE_QUIZ',
            reference_id: parseInt(quizId),
            reference_type: 'quiz',
            language: quiz?.course_language,
            metadata: {
              score: finalScore.percentage,
              points_earned: finalScore.earnedPoints,
              total_points: finalScore.totalPoints,
              questions_answered: Object.keys(allAnswers).length,
              total_questions: questions.length,
              quiz_title: quiz?.title,
              is_perfect_score: finalScore.percentage >= 100,
              passed: finalScore.percentage >= (quiz?.pass_percentage || 70)
            }
          }),
        });
      } catch (error) {
        console.error('Error awarding points:', error);
      }

      // Log quiz completion activity
      await logQuizActivity('COMPLETE_QUIZ');

    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setGapAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setShowAnswers(false);
  };

  const renderQuestion = (question: Question, index: number) => {
    const userAnswer = userAnswers[question.id];
    const isCorrect = userAnswer === question.correct_answer;

    if (question.question_type === 'multiple_choice') {
      return (
        <Card key={question.id} className={`mb-6 ${showResults ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {index + 1}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({question.points} {question.points === 1 ? 'point' : 'points'})
                </span>
              </CardTitle>
              {showResults && (
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">{question.question_text}</p>
            <div className="space-y-2">
              {question.answer_options.map((option: string, optionIndex: number) => {
                const isSelected = userAnswer === option;
                const isCorrectOption = option === question.correct_answer;
                
                return (
                  <label
                    key={optionIndex}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      showResults
                        ? isCorrectOption
                          ? 'bg-green-100 border-green-500'
                          : isSelected && !isCorrectOption
                          ? 'bg-red-100 border-red-500'
                          : 'bg-gray-50 border-gray-200'
                        : showAnswers && isCorrectOption
                        ? 'bg-green-100 border-green-500'
                        : isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={showResults}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      showResults
                        ? isCorrectOption
                          ? 'border-green-500 bg-green-500'
                          : isSelected && !isCorrectOption
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                        : showAnswers && isCorrectOption
                        ? 'border-green-500 bg-green-500'
                        : isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`} />
                    <span className={`${
                      (showResults || showAnswers) && isCorrectOption ? 'font-medium text-green-700' : ''
                    }`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
            {(showResults || showAnswers) && question.explanation && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (question.question_type === 'true_false') {
      return (
        <Card key={question.id} className={`mb-6 ${showResults ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {index + 1}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({question.points} {question.points === 1 ? 'point' : 'points'})
                </span>
              </CardTitle>
              {showResults && (
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">{question.question_text}</p>
            <div className="flex gap-4">
              {['True', 'False'].map((option) => {
                const isSelected = userAnswer === option;
                const isCorrectOption = option === question.correct_answer;
                
                return (
                  <label
                    key={option}
                    className={`flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors min-w-[100px] ${
                      showResults
                        ? isCorrectOption
                          ? 'bg-green-100 border-green-500'
                          : isSelected && !isCorrectOption
                          ? 'bg-red-100 border-red-500'
                          : 'bg-gray-50 border-gray-200'
                        : showAnswers && isCorrectOption
                        ? 'bg-green-100 border-green-500'
                        : isSelected
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={showResults}
                      className="sr-only"
                    />
                    <span className={`font-medium ${
                      (showResults || showAnswers) && isCorrectOption ? 'text-green-700' : ''
                    }`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
            {(showResults || showAnswers) && question.explanation && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (question.question_type === 'fill_blank') {
      const gaps = question.question_text.match(/\[BLANK\]/g) || [];
      const correctAnswers = question.correct_answer.split('|');
      const words = question.answer_options || [];
      
      // Split text by [BLANK] to create text parts and gap positions
      const textParts = question.question_text.split('[BLANK]');

      return (
        <Card key={question.id} className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {index + 1} - Fill in the gaps
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({question.points} {question.points === 1 ? 'point' : 'points'})
                </span>
              </CardTitle>
              {showResults && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Check individual gaps for results
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Render text with interactive gaps */}
            <div className="mb-6 text-gray-700 leading-relaxed">
              {textParts.map((textPart, partIndex) => (
                <span key={partIndex}>
                  {textPart}
                  {partIndex < textParts.length - 1 && (
                    <span
                      className={`inline-block min-w-[100px] px-2 py-1 mx-1 border-b-2 font-medium cursor-pointer transition-colors ${
                        showResults
                          ? (() => {
                              const gapKey = `${question.id}-gap-${partIndex}`;
                              const userGapAnswer = gapAnswers[gapKey] || '';
                              const correctAnswer = correctAnswers[partIndex] || '';
                              const isGapCorrect = userGapAnswer.toLowerCase() === correctAnswer.toLowerCase();
                              return isGapCorrect 
                                ? 'border-green-500 text-green-700 bg-green-50' 
                                : 'border-red-500 text-red-700 bg-red-50';
                            })()
                          : showAnswers
                          ? 'border-green-500 text-green-700 bg-green-50'
                          : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onDrop={(e) => handleDrop(e, `${question.id}-gap-${partIndex}`)}
                      onDragOver={handleDragOver}
                      data-gap-key={`${question.id}-gap-${partIndex}`}
                    >
                      {showResults
                        ? (gapAnswers[`${question.id}-gap-${partIndex}`] || '_____')
                        : showAnswers
                        ? (correctAnswers[partIndex] || '_____')
                        : (gapAnswers[`${question.id}-gap-${partIndex}`] || '_____')
                      }
                    </span>
                  )}
                </span>
              ))}
            </div>
            
            {!showResults && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Available words:</p>
                <div className="flex flex-wrap gap-2">
                  {words.map((word: string, wordIndex: number) => (
                    <span
                      key={wordIndex}
                      draggable
                      onDragStart={(e) => handleDragStart(e, word)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full cursor-move hover:bg-blue-200 transition-colors select-none"
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Drag words to the gaps above
                </p>
              </div>
            )}

            {showResults && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Correct answers:</p>
                <div className="flex flex-wrap gap-2">
                  {correctAnswers.map((answer, answerIndex) => (
                    <span key={answerIndex} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Gap {answerIndex + 1}: {answer}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(showResults || showAnswers) && question.explanation && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-700">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      
      if (question.question_type === 'fill_blank') {
        const gaps = question.question_text.match(/\[BLANK\]/g) || [];
        const correctAnswers = question.correct_answer.split('|');
        let correctGaps = 0;
        
        gaps.forEach((gap, index) => {
          const gapKey = `${question.id}-gap-${index}`;
          const userGapAnswer = gapAnswers[gapKey] || '';
          const correctAnswer = correctAnswers[index] || '';
          if (userGapAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            correctGaps++;
          }
        });
        
        // Award partial points for fill in gaps
        if (gaps.length > 0) {
          earnedPoints += (correctGaps / gaps.length) * question.points;
        }
      } else {
        const userAnswer = userAnswers[question.id];
        if (userAnswer === question.correct_answer) {
          earnedPoints += question.points;
        }
      }
    });

    return { totalPoints, earnedPoints, percentage: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0 };
  };

  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      'french': '🇫🇷',
      'german': '🇩🇪',
      'spanish': '🇪🇸',
      'english': '🇬🇧'
    };
    return flags[language.toLowerCase()] || '🌍';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz not found</h3>
        <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/content/quizzes">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </Link>
      </div>
    );
  }

  const score = showResults ? calculateScore() : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/content/quizzes" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Quizzes
        </Link>
      </div>

      {/* Quiz Controls */}
      {(userRole === 'teacher' || !quizCompleted) && (
        <div className="flex justify-end gap-2">
          {!quizCompleted ? (
            <>
              {userRole === 'teacher' && (
                <Button 
                  onClick={() => setShowAnswers(!showAnswers)}
                  variant={showAnswers ? "default" : "outline"}
                  size="sm"
                >
                  {showAnswers ? 'Hide' : 'Show'} Correct Answers
                </Button>
              )}
              <Button 
                onClick={resetQuiz}
                variant="outline"
                size="sm"
              >
                Reset Quiz
              </Button>
            </>
          ) : (
            <Button 
              onClick={resetQuiz}
              variant="outline"
              size="sm"
            >
              Take Again
            </Button>
          )}
        </div>
      )}

      {/* Student View Container */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Quiz Header (Student View) */}
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    {quiz.quiz_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {quiz.course_language && (
                    <span className="text-2xl">{getLanguageFlag(quiz.course_language)}</span>
                  )}
                </div>
                <CardTitle className="text-2xl text-gray-900 mb-2">{quiz.title}</CardTitle>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                
                {quiz.lesson_title && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Lesson:</span> {quiz.lesson_title}
                  </div>
                )}
                
                {quiz.course_title && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Course:</span> {quiz.course_title}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{quiz.time_limit} min</div>
                  <div className="text-gray-500">Time Limit</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{quiz.pass_percentage}%</div>
                  <div className="text-gray-500">Pass Grade</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{quiz.points_value}</div>
                  <div className="text-gray-500">Total Points</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    {quiz.max_attempts === 0 ? 'Unlimited' : quiz.max_attempts}
                  </div>
                  <div className="text-gray-500">Max Attempts</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FileQuestion className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">{questions.length}</div>
                  <div className="text-gray-500">Questions</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Results Summary */}
        {showResults && score && (
          <Card className={`mb-6 border-2 ${score.percentage >= quiz.pass_percentage ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${score.percentage >= quiz.pass_percentage ? 'text-green-700' : 'text-red-700'}`}>
                {score.percentage >= quiz.pass_percentage ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
                Quiz Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${score.percentage >= quiz.pass_percentage ? 'text-green-700' : 'text-red-700'}`}>
                    {score.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {score.earnedPoints.toFixed(1)} / {score.totalPoints}
                  </div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-xl font-bold ${score.percentage >= quiz.pass_percentage ? 'text-green-700' : 'text-red-700'}`}>
                    {score.percentage >= quiz.pass_percentage ? 'PASSED' : 'FAILED'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => renderQuestion(question, index))}
        </div>

        {/* Submit Button */}
        {!showResults && (
          <div className="mt-8 text-center">
            <Button onClick={submitQuiz} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Submit Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}