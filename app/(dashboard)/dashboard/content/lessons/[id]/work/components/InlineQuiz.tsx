'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/ui/audio-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Trophy,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  Play,
  RotateCcw
} from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string;
  pass_percentage: number;
  time_limit: number;
  max_attempts: number;
  points_value: number;
}

interface GapFillConfig {
  original_text: string;
  text_with_gaps: string;
  word_bank: string[];
  num_gaps: number;
  difficulty: string;
  allow_hints: boolean;
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

interface InlineQuizProps {
  quizId: number;
  onComplete: (score: number, passed: boolean) => void;
  onNext: () => void;
  lessonLanguage?: string;
}

export function InlineQuiz({ quizId, onComplete, onNext, lessonLanguage }: InlineQuizProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [gapFillConfig, setGapFillConfig] = useState<GapFillConfig | null>(null);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining !== null && timeRemaining > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev <= 1) {
            // Time's up, auto-submit
            submitQuiz();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining, quizCompleted]);

  const fetchQuizData = async () => {
    try {
      const [quizResponse, questionsResponse] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/questions`)
      ]);

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        
        // Parse quiz description JSON once; keep human description and config separate
        let processedQuizData = { ...quizData } as any;
        let parsedDescJson: any = null;
        if (quizData.description && typeof quizData.description === 'string') {
          try {
            parsedDescJson = JSON.parse(quizData.description);
            if (parsedDescJson?.description) {
              processedQuizData.description = parsedDescJson.description;
            }
          } catch (e) {
            processedQuizData.description = quizData.description;
          }
        }
        setQuiz(processedQuizData);
        
        // If gap_fill and config present in JSON, use it directly
        if (quizData.quiz_type === 'gap_fill' && parsedDescJson?.config?.gap_fill) {
          setGapFillConfig(parsedDescJson.config.gap_fill);
        }
        
        // Set time limit if specified
        if (quizData.time_limit) {
          setTimeRemaining(quizData.time_limit * 60); // Convert minutes to seconds
        }
      }

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        console.log('Loaded questions:', questionsData);
        setQuestions(questionsData);
             }
     } catch (error) {
       console.error('Error fetching quiz data:', error);
     } finally {
       setLoading(false);
     }
   };

   // Handle gap fill config building from questions after both quiz and questions are loaded (fallback when JSON didn't include config)
   useEffect(() => {
    if (quiz?.quiz_type === 'gap_fill' && !gapFillConfig && questions.length > 0) {
       console.log('Building gap fill config from questions');
       console.log('All questions:', questions);
       // Look for gap fill questions and build config (try both gap_fill and fill_blank)
       const gapFillQuestions = questions.filter((q: any) => 
         q.question_type === 'gap_fill' || q.question_type === 'fill_blank'
       );
       console.log('Gap fill questions found:', gapFillQuestions);
                if (gapFillQuestions.length > 0) {
           // Use the first gap fill question to build config
           const firstQuestion = gapFillQuestions[0];
           const gapText = firstQuestion.question_text;
           console.log('Gap text from question:', gapText);
           
           // Try different gap patterns
           const curlyGaps = gapText.match(/\{([^}]+)\}/g) || [];
           const blankGaps = gapText.match(/\[BLANK\]/g) || [];
           const gaps = curlyGaps.length > 0 ? curlyGaps : blankGaps;
           
           console.log('Found gaps:', gaps);
           
           let wordBank: string[] = [];
           if (curlyGaps.length > 0) {
             // Extract words from {word} format
             wordBank = curlyGaps.map((gap: string) => gap.replace(/\{|\}/g, ''));
           } else if (blankGaps.length > 0) {
             // For [BLANK] format, we need to get words from answer_options or correct_answer
             if (firstQuestion.answer_options && Array.isArray(firstQuestion.answer_options)) {
               wordBank = firstQuestion.answer_options;
             } else if (firstQuestion.correct_answer) {
               // Split correct answer if it contains multiple words separated by |
               wordBank = firstQuestion.correct_answer.split('|').map(word => word.trim());
             }
           }
           
           // If we still don't have a word bank, try to get it from the question data
           if (wordBank.length === 0) {
             console.log('No word bank generated, checking question data:', firstQuestion);
             if (firstQuestion.answer_options) {
               console.log('Answer options found:', firstQuestion.answer_options);
               if (Array.isArray(firstQuestion.answer_options)) {
                 wordBank = firstQuestion.answer_options;
               } else if (typeof firstQuestion.answer_options === 'string') {
                 try {
                   const parsed = JSON.parse(firstQuestion.answer_options);
                   if (Array.isArray(parsed)) {
                     wordBank = parsed;
                   }
                 } catch (e) {
                   // If it's not JSON, treat as comma-separated string
                   wordBank = firstQuestion.answer_options.split(',').map(word => word.trim());
                 }
               }
             }
           }
           
           console.log('Generated word bank:', wordBank);
           
           // If we still don't have a word bank, create one from the gaps
           if (wordBank.length === 0 && gaps.length > 0) {
             console.log('Creating fallback word bank from gaps');
             wordBank = gaps.map((gap: string) => gap.replace(/\{|\}|\[BLANK\]/g, ''));
           }
           
           const config: GapFillConfig = {
             original_text: gapText,
             text_with_gaps: gapText,
             word_bank: wordBank,
             num_gaps: gaps.length,
             difficulty: 'medium',
             allow_hints: true
           };
         
         setGapFillConfig(config);
         console.log('Built gap fill config from questions:', config);
       }
     }
   }, [quiz, questions, gapFillConfig]);

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
          setGapAnswers(prev => {
        const newAnswers = {
          ...prev,
          [gapKey]: word
        };
        return newAnswers;
      });
    setDraggedWord(null);
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    const calculatedScore = calculateScore();
    const calculatedPassed = calculatedScore >= quiz.pass_percentage;
    
    setScore(calculatedScore);
    setPassed(calculatedPassed);
    setQuizCompleted(true);
    setShowResults(true);
    setTimeRemaining(null);

    // Call the completion callback
    onComplete(calculatedScore, calculatedPassed);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setGapAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setScore(null);
    setPassed(null);
    if (quiz?.time_limit) {
      setTimeRemaining(quiz.time_limit * 60);
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    // Handle gap fill quiz scoring
    if (quiz?.quiz_type === 'gap_fill' && gapFillConfig) {
      const cfgAny: any = gapFillConfig as any;
      const textWithGaps: string =
        gapFillConfig.text_with_gaps || cfgAny?.gf_text_content || cfgAny?.text_content || '';
      const wordBankArr: string[] = Array.isArray(gapFillConfig.word_bank)
        ? (gapFillConfig.word_bank as string[])
        : typeof gapFillConfig.word_bank === 'string'
          ? (gapFillConfig.word_bank as string)
              .split(/[\n,]/)
              .map((w) => w.trim())
              .filter(Boolean)
        : Array.isArray(cfgAny?.gf_word_bank)
          ? (cfgAny.gf_word_bank as string[])
          : typeof cfgAny?.gf_word_bank === 'string'
            ? (cfgAny.gf_word_bank as string).split(/[\n,]/).map((w) => w.trim()).filter(Boolean)
            : [];

      const blankGaps = (textWithGaps.match(/\[BLANK\]/g) || []);
      const wordGaps = (textWithGaps.match(/\{([^}]+)\}/g) || []);
      const gaps = blankGaps.length > 0 ? blankGaps : wordGaps;
      const useWordFormat = wordGaps.length > 0;
      
      // Count actual gaps by iterating through text parts
      const textParts = textWithGaps.split(useWordFormat ? /(\{[^}]+\})/ : /(\[BLANK\])/);
      let actualGapCount = 0;
      textParts.forEach((part) => {
        const isGap = useWordFormat ? part.match(/\{[^}]+\}/) : part === '[BLANK]';
        if (isGap) {
          actualGapCount++;
        }
      });
      
      totalPoints = actualGapCount;
      // Gap counting complete
      
      // For scoring, we need to iterate through the text parts to match the gap key generation
      // textParts is already defined above, so we can reuse it
      let gapIndex = 0;
      
      // Debug logging for gap fill scoring
      
      textParts.forEach((part, partIndex) => {
        const isGap = useWordFormat ? part.match(/\{[^}]+\}/) : part === '[BLANK]';
        if (isGap) {
          const gapKey = `gap-${partIndex}`;
          const userAnswer = gapAnswers[gapKey];
          
          // Debug logging for individual gaps
          
          if (useWordFormat) {
            const correctAnswer = part.replace(/\{|\}/g, '');
            const isCorrect = userAnswer && userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
            if (isCorrect) {
              earnedPoints++;
            }
          } else {
            const isCorrect = userAnswer && wordBankArr.includes(userAnswer);
            if (isCorrect) {
              earnedPoints++;
            }
          }
        }
      });
      
      // Final score calculation complete
    } else {
      // Handle regular question-based quiz scoring
      questions.forEach(question => {
        totalPoints += question.points;
        
        if (question.question_type === 'multiple_choice') {
          const userAnswer = userAnswers[question.id];
          if (userAnswer === question.correct_answer) {
            earnedPoints += question.points;
          }
        } else if (question.question_type === 'true_false') {
          const userAnswer = userAnswers[question.id];
          if (userAnswer === question.correct_answer) {
            earnedPoints += question.points;
          }
        } else if (question.question_type === 'gap_fill') {
          // Handle gap fill questions
          const gapText = question.question_text;
          const gaps = gapText.match(/\{([^}]+)\}/g) || [];
          
          let gapCorrect = 0;
          gaps.forEach((gap, index) => {
            const gapKey = `${question.id}-${index}`;
            const userAnswer = gapAnswers[gapKey];
            const correctAnswer = gap.replace(/\{|\}/g, '');
            
            if (userAnswer && userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
              gapCorrect++;
            }
          });
          
          if (gapCorrect === gaps.length) {
            earnedPoints += question.points;
          }
        }
      });
    }

    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const renderGapFillContent = () => {
    if (!gapFillConfig) return null;

    // Normalize fields from different shapes (new and legacy)
    const cfgAny: any = gapFillConfig as any;
    const textWithGaps: string =
      gapFillConfig.text_with_gaps || cfgAny?.gf_text_content || cfgAny?.text_content || '';
    const wordBankArr: string[] = Array.isArray(gapFillConfig.word_bank)
      ? (gapFillConfig.word_bank as string[])
      : typeof gapFillConfig.word_bank === 'string'
        ? (gapFillConfig.word_bank as string)
            .split(/[\n,]/)
            .map((w) => w.trim())
            .filter(Boolean)
      : typeof cfgAny?.gf_word_bank === 'string'
        ? (cfgAny.gf_word_bank as string).split(/[\n,]/).map((w) => w.trim()).filter(Boolean)
        : Array.isArray(cfgAny?.gf_word_bank)
          ? (cfgAny.gf_word_bank as string[])
          : Array.isArray(cfgAny?.word_bank)
            ? (cfgAny.word_bank as string[])
            : [];

    // Check if we're using [BLANK] format or {word} format
    const blankGaps = (textWithGaps.match(/\[BLANK\]/g) || []);
    const wordGaps = (textWithGaps.match(/\{([^}]+)\}/g) || []);
    const gaps = blankGaps.length > 0 ? blankGaps : wordGaps;
    const useWordFormat = wordGaps.length > 0;
    
    return (
      <div className="space-y-6">
        {/* Word Bank */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Word Bank</h3>
          <div className="flex flex-wrap gap-2">
            {wordBankArr.map((word, index) => (
              <span
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, word)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full cursor-move hover:bg-blue-200 transition-colors select-none"
              >
                {word}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Drag words to the gaps below
          </p>
        </div>

        {/* Text with Gaps */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Fill in the gaps:</h3>
          <div className="text-gray-700 leading-relaxed">
            {useWordFormat 
              ? textWithGaps.split(/(\{[^}]+\})/).map((part, partIndex) => {
                  if (part.match(/\{[^}]+\}/)) {
                    // Use partIndex instead of finding the gap index to ensure unique keys
                    const gapKey = `gap-${partIndex}`;
                    const correctAnswer = part.replace(/\{|\}/g, '');
                    const userAnswer = gapAnswers[gapKey];
                    
                    return (
                      <span key={partIndex}>
                        <span
                          className={`inline-block min-w-[100px] px-2 py-1 mx-1 border-b-2 font-medium cursor-pointer transition-colors ${
                            quizCompleted 
                              ? userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
                                ? 'border-green-500 text-green-700 bg-green-50' 
                                : 'border-red-500 text-red-700 bg-red-50'
                              : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                          }`}
                          onDrop={(e) => handleDrop(e, gapKey)}
                          onDragOver={handleDragOver}
                          data-gap-key={gapKey}
                        >
                          {userAnswer || '_____'}
                        </span>
                      </span>
                    );
                  }
                  return <span key={partIndex}>{part}</span>;
                })
              : textWithGaps.split(/(\[BLANK\])/).map((part, partIndex) => {
                  if (part === '[BLANK]') {
                    // Use partIndex instead of finding the gap index to ensure unique keys
                    const gapKey = `gap-${partIndex}`;
                    const userAnswer = gapAnswers[gapKey];
                    
                    return (
                      <span key={partIndex}>
                        <span
                          className={`inline-block min-w-[100px] px-2 py-1 mx-1 border-b-2 font-medium cursor-pointer transition-colors ${
                            quizCompleted 
                              ? userAnswer && wordBankArr.includes(userAnswer)
                                ? 'border-green-500 text-green-700 bg-gray-50' 
                                : 'border-red-500 text-red-700 bg-red-50'
                              : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
                          }`}
                          onDrop={(e) => handleDrop(e, gapKey)}
                          onDragOver={handleDragOver}
                          data-gap-key={gapKey}
                        >
                          {userAnswer || '_____'}
                        </span>
                      </span>
                    );
                  }
                  return <span key={partIndex}>{part}</span>;
                })
            }
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (question: Question, index: number) => {
    if (question.question_type === 'multiple_choice') {
      return (
        <div key={question.id} className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            {index + 1}. {question.question_text}
          </h3>
          <div className="space-y-2">
            {question.answer_options?.map((option: string, optionIndex: number) => (
              <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={quizCompleted}
                  className="text-blue-600"
                />
                <span className={quizCompleted && option === question.correct_answer ? 'text-green-600 font-medium' : ''}>
                  {option}
                </span>
                {quizCompleted && option === question.correct_answer && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </label>
            ))}
          </div>
          {quizCompleted && question.explanation && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      );
    } else if (question.question_type === 'true_false') {
      return (
        <div key={question.id} className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            {index + 1}. {question.question_text}
          </h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="true"
                checked={userAnswers[question.id] === 'true'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                disabled={quizCompleted}
                className="text-blue-600"
              />
              <span className={quizCompleted && question.correct_answer === 'true' ? 'text-green-600 font-medium' : ''}>
                True
              </span>
              {quizCompleted && question.correct_answer === 'true' && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="false"
                checked={userAnswers[question.id] === 'false'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                disabled={quizCompleted}
                className="text-blue-600"
              />
              <span className={quizCompleted && question.correct_answer === 'false' ? 'text-green-600 font-medium' : ''}>
                False
              </span>
              {quizCompleted && question.correct_answer === 'false' && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </label>
          </div>
          {quizCompleted && question.explanation && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      );
    } else if (question.question_type === 'gap_fill') {
      console.log('Rendering gap_fill question:', question);
      const gapText = question.question_text;
      const gaps = gapText.match(/\{([^}]+)\}/g) || [];
      console.log('Gap text:', gapText, 'Found gaps:', gaps);
      
      return (
        <div key={question.id} className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            {index + 1}. Fill in the gaps:
          </h3>
          <div className="mb-4">
            {gapText.split(/(\{[^}]+\})/).map((part, partIndex) => {
              if (part.match(/\{[^}]+\}/)) {
                // Use partIndex for unique gap keys instead of gaps.indexOf
                const gapKey = `${question.id}-${partIndex}`;
                const correctAnswer = part.replace(/\{|\}/g, '');
                const userAnswer = gapAnswers[gapKey];
                
                return (
                  <span key={partIndex}>
                    <input
                      type="text"
                      value={userAnswer || ''}
                      onChange={(e) => handleGapAnswerChange(gapKey, e.target.value)}
                      disabled={quizCompleted}
                      className={`inline-block w-24 px-2 py-1 border rounded text-center mx-1 ${
                        quizCompleted 
                          ? userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-red-100 border-red-500 text-red-800'
                          : 'border-gray-300'
                      }`}
                      placeholder="..."
                    />
                  </span>
                );
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </div>
          {quizCompleted && question.explanation && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={question.id} className="mb-6">
        <h3 className="text-lg font-medium mb-3">
          {index + 1}. {question.question_text}
        </h3>
        <p className="text-gray-600">Question type "{question.question_type}" not supported in inline mode. Please take this quiz on the full quiz page.</p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz not found</h3>
            <p className="text-gray-600">The quiz could not be loaded.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5" />
          {quiz.title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Badge variant="outline">{quiz.quiz_type}</Badge>
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {quiz.points_value} pts
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <>
            <div className="mb-6">
              <p className="text-gray-700">{quiz.description}</p>
            </div>
            
            {quiz?.quiz_type === 'gap_fill' ? (
              gapFillConfig ? (
                <>
                  {/* Pre-Card: Original Complete Text with Audio */}
                  <div className="mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileQuestion className="h-5 w-5" />
                          Original Complete Text
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                          {(() => {
                            const cfgAny: any = gapFillConfig as any;
                            const sourceText =
                              gapFillConfig.original_text ||
                              cfgAny?.gf_original_text ||
                              gapFillConfig.text_with_gaps ||
                              cfgAny?.gf_text_content ||
                              '';
                            // If original is missing, derive by removing placeholders
                            const derived = (sourceText || '')
                              .replace(/\{([^}]+)\}/g, '$1')
                              .replace(/\[BLANK\]/g, '');
                            const displayText = gapFillConfig.original_text || cfgAny?.gf_original_text ? sourceText : derived;
                            return (
                              <div className="flex-1 whitespace-pre-wrap text-sm text-gray-700">{displayText}</div>
                            );
                          })()}
                          {(() => {
                            const cfgAny: any = gapFillConfig as any;
                            const sourceText =
                              gapFillConfig.original_text ||
                              cfgAny?.gf_original_text ||
                              gapFillConfig.text_with_gaps ||
                              cfgAny?.gf_text_content ||
                              '';
                            const derived = (sourceText || '')
                              .replace(/\{([^}]+)\}/g, '$1')
                              .replace(/\[BLANK\]/g, '');
                            const audioText = gapFillConfig.original_text || cfgAny?.gf_original_text ? sourceText : derived;
                            return (
                              <AudioPlayer
                                text={audioText}
                                language={lessonLanguage || 'english'}
                                size="md"
                                type="content"
                              showSpeedControl={true}
                              />
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {renderGapFillContent()}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Gap Fill Content Not Found</h3>
                  <p className="text-gray-600">This gap fill quiz doesn't have the required content configuration.</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {questions.length > 0 ? (
                  questions.map((question, index) => renderQuestion(question, index))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-600">This quiz doesn't have any questions yet.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={resetQuiz}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Quiz
              </Button>
              
              <Button
                onClick={submitQuiz}
                disabled={quizCompleted}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Submit Quiz
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            
            <h3 className="text-2xl font-bold mb-2">
              {passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h3>
            
            <p className="text-lg mb-4">
              Your score: <span className="font-bold">{score}%</span>
            </p>
            
            <p className="text-gray-600 mb-6">
              {passed 
                ? `Congratulations! You passed with ${score}% (required: ${quiz.pass_percentage}%)`
                : `You need ${quiz.pass_percentage}% to pass. Try again!`
              }
            </p>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={resetQuiz}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              
              {passed && (
                <Button
                  onClick={onNext}
                  className="flex items-center gap-2"
                >
                  Continue
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 