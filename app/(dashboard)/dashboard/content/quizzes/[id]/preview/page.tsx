'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  BookOpen
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

export default function QuizPreviewPage() {
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
        setQuiz(quizData);
      }

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageFlag = (language: string) => {
    const flags = {
      french: '🇫🇷',
      german: '🇩🇪',
      spanish: '🇪🇸'
    };
    return flags[language as keyof typeof flags] || '🌐';
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return 'No time limit';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const parseQuizDescription = (description: string) => {
    try {
      const parsed = JSON.parse(description || '{}');
      return parsed.description || description || '';
    } catch (error) {
      return description || '';
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDragEnd = () => {
    setDraggedWord(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, gapId: string, questionId: number) => {
    e.preventDefault();
    if (draggedWord && !quizCompleted) {
      // Update the gap with the dropped word
      setGapAnswers(prev => ({
        ...prev,
        [gapId]: draggedWord
      }));
      
      // Update the overall answer for scoring
      const updatedGapAnswers = { ...gapAnswers, [gapId]: draggedWord };
      const answerArray = Object.values(updatedGapAnswers);
      handleAnswerSelect(questionId, answerArray.join(', '));
    }
    setDraggedWord(null);
  };

  const removeWordFromGap = (gapId: string, questionId: number) => {
    setGapAnswers(prev => {
      const updated = { ...prev };
      delete updated[gapId];
      
      // Update the overall answer for scoring
      const answerArray = Object.values(updated);
      handleAnswerSelect(questionId, answerArray.join(', '));
      
      return updated;
    });
  };

  const renderGapFillText = (question: Question) => {
    const textContent = question.question_text.replace('Complete the text by filling in the gaps:\n\n', '');
    const parts = textContent.split('_____');
    
    return (
      <div className="text-lg leading-relaxed">
        {parts.map((part, index) => {
          const gapValue = gapAnswers[`gap-${index}`];
          const showCorrectness = showResults || showAnswers;
          const isCorrectGap = gapValue && question.answer_options && question.answer_options.includes(gapValue);
          
          return (
            <span key={index}>
              {part}
              {index < parts.length - 1 && (
                <span
                  className={`inline-block min-w-[120px] min-h-[45px] mx-2 px-3 py-2 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ${
                    showCorrectness && gapValue
                      ? isCorrectGap
                        ? 'border-green-500 bg-green-100 text-green-800 font-semibold shadow-sm'
                        : 'border-red-500 bg-red-100 text-red-800 font-semibold shadow-sm'
                      : gapValue 
                      ? 'border-blue-500 bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 shadow-sm' 
                      : draggedWord
                      ? 'border-green-400 bg-green-100 text-green-700 scale-105 shadow-md animate-pulse'
                      : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, `gap-${index}`, question.id)}
                  onClick={() => gapValue && !quizCompleted && removeWordFromGap(`gap-${index}`, question.id)}
                  title={
                    quizCompleted 
                      ? (showCorrectness && gapValue ? (isCorrectGap ? 'Correct!' : 'Incorrect') : 'Quiz completed')
                      : gapValue 
                      ? 'Click to remove word' 
                      : 'Drop a word here'
                  }
                >
                  {gapValue || (draggedWord ? '👆 Drop here' : '___')}
                  {showCorrectness && gapValue && (
                    <span className="ml-1">
                      {isCorrectGap ? '✓' : '✗'}
                    </span>
                  )}
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  const submitQuiz = () => {
    setQuizCompleted(true);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setShowAnswers(false);
    setGapAnswers({});
  };

  const calculateScore = () => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.correct_answer;
      
      if (userAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correctCount++;
        earnedPoints += question.points;
      }
    });

    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = percentage >= (quiz?.pass_percentage || 70);

    return {
      correctCount,
      totalQuestions: questions.length,
      percentage,
      earnedPoints,
      totalPoints,
      passed
    };
  };

  const isAnswerCorrect = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    const userAnswer = userAnswers[questionId];
    
    if (!question || !userAnswer) return false;
    
    // For gap fill questions with answer_options, check if answers match the word bank
    if (question.answer_options && Array.isArray(question.answer_options) && question.answer_options.length > 0) {
      const userAnswerArray = userAnswer.split(', ').filter(word => word.trim());
      const correctAnswerArray = question.correct_answer.split(', ').filter(word => word.trim());
      
      // Check if user has filled all gaps and if the words are from the word bank
      const numGaps = question.question_text.split('_____').length - 1;
      return userAnswerArray.length === numGaps && 
             userAnswerArray.every(word => question.answer_options.includes(word.trim()));
    }
    
    // For regular fill_blank questions, do exact match
    return userAnswer.toLowerCase() === question.correct_answer.toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz not found</h2>
          <p className="text-gray-600 mb-4">The quiz you're trying to preview doesn't exist.</p>
          <Link href="/dashboard/content/quizzes">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes dragPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .drag-over {
          animation: dragPulse 1s infinite;
        }
      `}</style>
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/content/quizzes/${quizId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quiz Management
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-900">Quiz Preview Mode</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Admin View
              </Badge>
            </div>
          </div>
                     <div className="flex gap-2">
             {!quizCompleted ? (
               <>
                 <Button 
                   onClick={() => setShowAnswers(!showAnswers)}
                   variant={showAnswers ? "default" : "outline"}
                   size="sm"
                 >
                   {showAnswers ? 'Hide' : 'Show'} Correct Answers
                 </Button>
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
        </div>
      </div>

      {/* Student View Container */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Quiz Header (Student View) */}
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</CardTitle>
                {quiz.course_language && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getLanguageFlag(quiz.course_language)}</span>
                    {quiz.lesson_title && (
                      <span className="text-gray-600">{quiz.lesson_title}</span>
                    )}
                    {quiz.course_title && (
                      <span className="text-gray-600">• {quiz.course_title}</span>
                    )}
                  </div>
                )}
                {parseQuizDescription(quiz.description) && (
                  <p className="text-gray-700 mb-4">{parseQuizDescription(quiz.description)}</p>
                )}
              </div>
              <div className="text-right">
                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  {quiz.quiz_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Quiz Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">Questions</p>
                  <p className="font-semibold">{totalQuestions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-600">Total Points</p>
                  <p className="font-semibold">{totalPoints}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-600">Time Limit</p>
                  <p className="font-semibold text-sm">{formatDuration(quiz.time_limit)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-600">Pass Grade</p>
                  <p className="font-semibold">{quiz.pass_percentage}%</p>
                </div>
              </div>
            </div>

            {/* Quiz Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Instructions</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Answer all {totalQuestions} questions to the best of your ability</li>
                    <li>• You need {quiz.pass_percentage}% to pass this quiz</li>
                    {quiz.time_limit > 0 && (
                      <li>• You have {formatDuration(quiz.time_limit)} to complete this quiz</li>
                    )}
                    <li>• You can attempt this quiz {quiz.max_attempts === 0 ? 'unlimited times' : `up to ${quiz.max_attempts} times`}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardHeader>
                 </Card>

         {/* Quiz Results */}
         {showResults && (
           <Card className="mb-6 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 {calculateScore().passed ? (
                   <CheckCircle className="h-6 w-6 text-green-600" />
                 ) : (
                   <AlertCircle className="h-6 w-6 text-orange-500" />
                 )}
                 Quiz Results
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="text-center">
                   <div className="text-2xl font-bold text-gray-900">{calculateScore().percentage}%</div>
                   <div className="text-sm text-gray-600">Final Score</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-gray-900">
                     {calculateScore().correctCount}/{calculateScore().totalQuestions}
                   </div>
                   <div className="text-sm text-gray-600">Correct Answers</div>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold text-gray-900">
                     {calculateScore().earnedPoints}/{calculateScore().totalPoints}
                   </div>
                   <div className="text-sm text-gray-600">Points Earned</div>
                 </div>
                 <div className="text-center">
                   <div className={`text-2xl font-bold ${calculateScore().passed ? 'text-green-600' : 'text-orange-500'}`}>
                     {calculateScore().passed ? 'PASSED' : 'FAILED'}
                   </div>
                   <div className="text-sm text-gray-600">
                     Need {quiz?.pass_percentage}% to pass
                   </div>
                 </div>
               </div>
               {!calculateScore().passed && (
                 <div className="mt-4 bg-orange-50 border border-orange-200 p-3 rounded-lg">
                   <p className="text-sm text-orange-700">
                     <strong>Keep trying!</strong> You need {quiz?.pass_percentage}% to pass. 
                     Review the correct answers below and try again.
                   </p>
                 </div>
               )}
             </CardContent>
           </Card>
         )}

         {/* Questions */}
        {questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                                       <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                             Question {index + 1}
                           </span>
                           <Badge variant="outline" className="text-xs">
                             {question.question_type.replace('_', ' ')}
                           </Badge>
                           <span className="text-sm text-gray-600">
                             {question.points} {question.points === 1 ? 'point' : 'points'}
                           </span>
                         </div>
                         {/* Only show question text for non-gap-fill questions */}
                         {!(question.answer_options && Array.isArray(question.answer_options) && question.answer_options.length > 0) && (
                           <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                             {question.question_text}
                           </h3>
                         )}
                       </div>
                     </div>
                </CardHeader>
                <CardContent>
                                     {/* Multiple Choice */}
                   {question.question_type === 'multiple_choice' && question.answer_options && (
                     <div className="space-y-3">
                       {question.answer_options.map((option: string, optionIndex: number) => {
                         const isSelected = userAnswers[question.id] === option;
                         const isCorrect = option === question.correct_answer;
                         const showCorrectness = showResults || showAnswers;
                         
                         let borderColor = 'border-gray-200';
                         let bgColor = 'hover:bg-gray-50';
                         let textColor = 'text-gray-900';
                         
                         if (showCorrectness) {
                           if (isSelected && isCorrect) {
                             borderColor = 'border-green-500 bg-green-50';
                             textColor = 'text-green-700 font-medium';
                           } else if (isSelected && !isCorrect) {
                             borderColor = 'border-red-500 bg-red-50';
                             textColor = 'text-red-700';
                           } else if (!isSelected && isCorrect) {
                             borderColor = 'border-green-300 bg-green-50';
                             textColor = 'text-green-600';
                           }
                         } else if (isSelected) {
                           borderColor = 'border-blue-500 bg-blue-50';
                           textColor = 'text-blue-700';
                         }
                         
                         return (
                           <div 
                             key={optionIndex} 
                             className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${borderColor} ${bgColor}`}
                             onClick={() => !quizCompleted && handleAnswerSelect(question.id, option)}
                           >
                             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                               isSelected ? 'border-blue-500' : 'border-gray-300'
                             }`}>
                               {isSelected && (
                                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                               )}
                               {showCorrectness && isCorrect && (
                                 <CheckCircle className="h-3 w-3 text-green-600" />
                               )}
                             </div>
                             <span className="font-medium text-gray-600 min-w-[20px]">
                               {String.fromCharCode(65 + optionIndex)}.
                             </span>
                             <span className={`flex-1 ${textColor}`}>
                               {option}
                             </span>
                             {showCorrectness && isSelected && !isCorrect && (
                               <AlertCircle className="h-4 w-4 text-red-500" />
                             )}
                           </div>
                         );
                       })}
                     </div>
                   )}

                                     {/* True/False */}
                   {question.question_type === 'true_false' && (
                     <div className="space-y-3">
                       {['true', 'false'].map((option) => {
                         const isSelected = userAnswers[question.id] === option;
                         const isCorrect = option === question.correct_answer.toLowerCase();
                         const showCorrectness = showResults || showAnswers;
                         
                         let borderColor = 'border-gray-200';
                         let bgColor = 'hover:bg-gray-50';
                         let textColor = 'text-gray-900';
                         
                         if (showCorrectness) {
                           if (isSelected && isCorrect) {
                             borderColor = 'border-green-500 bg-green-50';
                             textColor = 'text-green-700 font-medium';
                           } else if (isSelected && !isCorrect) {
                             borderColor = 'border-red-500 bg-red-50';
                             textColor = 'text-red-700';
                           } else if (!isSelected && isCorrect) {
                             borderColor = 'border-green-300 bg-green-50';
                             textColor = 'text-green-600';
                           }
                         } else if (isSelected) {
                           borderColor = 'border-blue-500 bg-blue-50';
                           textColor = 'text-blue-700';
                         }
                         
                         return (
                           <div 
                             key={option} 
                             className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${borderColor} ${bgColor}`}
                             onClick={() => !quizCompleted && handleAnswerSelect(question.id, option)}
                           >
                             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                               isSelected ? 'border-blue-500' : 'border-gray-300'
                             }`}>
                               {isSelected && (
                                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                               )}
                               {showCorrectness && isCorrect && (
                                 <CheckCircle className="h-3 w-3 text-green-600" />
                               )}
                             </div>
                             <span className={`capitalize ${textColor}`}>
                               {option}
                             </span>
                             {showCorrectness && isSelected && !isCorrect && (
                               <AlertCircle className="h-4 w-4 text-red-500" />
                             )}
                           </div>
                         );
                       })}
                     </div>
                   )}

                                     {/* Fill in the Blank / Short Answer */}
                   {(question.question_type === 'fill_blank' || question.question_type === 'short_answer') && (
                     <div className="space-y-3">
                       {/* Check if this is a gap fill question (has answer_options array) */}
                       {question.answer_options && Array.isArray(question.answer_options) && question.answer_options.length > 0 ? (
                         /* Gap Fill Drag & Drop Interface */
                         <div className="space-y-6">
                           {/* Instructions */}
                           <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                             <p className="text-sm font-medium text-blue-800 mb-1">
                               📝 How to complete this exercise:
                             </p>
                             <ul className="text-sm text-blue-700 space-y-1">
                               <li>• <strong>Drag</strong> words from the word bank below</li>
                               <li>• <strong>Drop</strong> them into the gaps in the text</li>
                               <li>• <strong>Click</strong> on placed words to remove them</li>
                             </ul>
                           </div>

                           {/* Gap Fill Text */}
                           <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                             <h4 className="text-sm font-medium text-gray-600 mb-4">Complete the text:</h4>
                             {renderGapFillText(question)}
                           </div>
                           
                           {/* Word Bank */}
                           <div>
                             <p className="text-sm font-medium text-gray-600 mb-3">
                               📚 Word Bank - Drag these words to fill the gaps:
                             </p>
                             <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg min-h-[80px]">
                               {question.answer_options.map((word: string, index: number) => {
                                 const isUsed = Object.values(gapAnswers).includes(word);
                                 return (
                                   <div
                                     key={index}
                                     draggable={!quizCompleted && !isUsed}
                                     onDragStart={() => handleDragStart(word)}
                                     onDragEnd={handleDragEnd}
                                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform ${
                                       isUsed
                                         ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                                         : quizCompleted
                                         ? 'bg-white border border-gray-300 text-gray-700 cursor-default'
                                         : 'bg-white border-2 border-green-300 text-green-700 cursor-grab hover:border-green-400 hover:bg-green-50 hover:scale-105 active:cursor-grabbing active:scale-95'
                                     } ${draggedWord === word ? 'opacity-50 scale-95' : ''}`}
                                     title={isUsed ? 'Already used' : quizCompleted ? 'Quiz completed' : 'Drag to a gap'}
                                   >
                                     {word}
                                   </div>
                                 );
                               })}
                             </div>
                             {!quizCompleted && (
                               <p className="text-xs text-gray-500 mt-2">
                                 💡 Tip: Words become grayed out when used. Click on words in gaps to remove them.
                               </p>
                             )}
                           </div>

                                                        {/* Progress Indicator */}
                             <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                               <div className="flex items-center justify-between text-sm">
                                 <span className="text-gray-600">Progress:</span>
                                 <span className="font-medium text-gray-900">
                                   {Object.keys(gapAnswers).length} / {question.question_text.split('_____').length - 1} gaps filled
                                 </span>
                               </div>
                               <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                 <div
                                   className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                   style={{
                                     width: `${(Object.keys(gapAnswers).length / (question.question_text.split('_____').length - 1)) * 100}%`
                                   }}
                                 ></div>
                               </div>
                               {Object.keys(gapAnswers).length === (question.question_text.split('_____').length - 1) && !quizCompleted && (
                                 <div className="mt-3 text-center">
                                   <div className="inline-flex items-center px-3 py-1 bg-green-100 border border-green-300 rounded-full text-sm text-green-700 font-medium">
                                     ✅ All gaps filled! Ready to submit.
                                   </div>
                                 </div>
                               )}
                             </div>
                         </div>
                       ) : (
                         /* Regular Fill in the Blank Interface */
                         <div className={`p-3 border rounded-lg ${
                           showResults && userAnswers[question.id] 
                             ? isAnswerCorrect(question.id) 
                               ? 'border-green-500 bg-green-50' 
                               : 'border-red-500 bg-red-50'
                             : 'border-gray-200'
                         }`}>
                           <input
                             type="text"
                             placeholder="Type your answer here..."
                             className="w-full border-none outline-none text-gray-900 bg-transparent"
                             value={userAnswers[question.id] || ''}
                             onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                             disabled={quizCompleted}
                           />
                         </div>
                       )}
                       
                                                {(showAnswers || showResults) && (
                         <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                           {/* Special feedback for gap fill questions */}
                           {question.answer_options && Array.isArray(question.answer_options) && question.answer_options.length > 0 ? (
                             <div>
                               <p className="text-sm text-green-700 mb-2">
                                 <strong>✅ Gap Fill Exercise:</strong> 
                                 {isAnswerCorrect(question.id) ? ' All gaps filled correctly!' : ' Check your answers below.'}
                               </p>
                               <div className="text-sm">
                                 <p className="text-green-600 mb-1"><strong>Available words:</strong> {question.answer_options.join(', ')}</p>
                                 {showResults && userAnswers[question.id] && (
                                   <p className="text-gray-700">
                                     <strong>Your answers:</strong> {userAnswers[question.id] || 'No gaps filled'}
                                   </p>
                                 )}
                               </div>
                             </div>
                           ) : (
                             <div>
                               <p className="text-sm text-green-700">
                                 <strong>Correct Answer:</strong> {question.correct_answer}
                               </p>
                               {showResults && userAnswers[question.id] && !isAnswerCorrect(question.id) && (
                                 <p className="text-sm text-red-700 mt-1">
                                   <strong>Your Answer:</strong> {userAnswers[question.id]}
                                 </p>
                               )}
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   )}

                                     {/* Explanation */}
                   {(showAnswers || showResults) && question.explanation && (
                     <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                       <p className="text-sm text-blue-700">
                         <strong>Explanation:</strong> {question.explanation}
                       </p>
                     </div>
                   )}
                </CardContent>
              </Card>
            ))}

                         {/* Submit Button */}
             {!quizCompleted && (
               <Card className="bg-blue-50 border-2 border-blue-200">
                 <CardContent className="text-center py-8">
                   <h3 className="font-medium text-gray-900 mb-2">Ready to Submit?</h3>
                   <p className="text-gray-600 mb-4">
                     Review your answers above, then submit to see your results
                   </p>
                   <div className="flex justify-center gap-3">
                     <Button 
                       onClick={submitQuiz}
                       className="bg-blue-500 hover:bg-blue-600 text-white"
                       disabled={Object.keys(userAnswers).length === 0}
                     >
                       <Play className="h-4 w-4 mr-2" />
                       Submit Quiz
                     </Button>
                     <Button 
                       onClick={resetQuiz}
                       variant="outline"
                     >
                       Clear All Answers
                     </Button>
                   </div>
                   <p className="text-sm text-gray-500 mt-2">
                     Answered: {Object.keys(userAnswers).length}/{questions.length} questions
                   </p>
                 </CardContent>
               </Card>
             )}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Yet</h3>
              <p className="text-gray-600 mb-6">
                This quiz doesn't have any questions yet. Add some questions to see the preview.
              </p>
              <Link href={`/dashboard/content/quizzes/${quizId}/questions/create`}>
                <Button>
                  Add First Question
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 