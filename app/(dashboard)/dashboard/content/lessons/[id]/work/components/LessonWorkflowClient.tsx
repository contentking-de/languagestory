'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  BookOpen,
  Languages,
  FileQuestion,
  Gamepad2,
  Trophy,
  Clock,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { AudioPlayer } from '@/components/ui/audio-player';
import { InlineQuiz } from './InlineQuiz';
import { InlineGame } from './InlineGame';
import { LessonCompletionModal } from '@/components/lesson-completion-modal';

interface Lesson {
  id: number;
  title: string;
  content: string;
  cultural_information?: string;
  course_language: string;
  points_value: number;
}

interface Quiz {
  id: number;
  title: string;
  quiz_type: string;
  points_value: number;
  is_published: boolean;
}

interface Game {
  id: number;
  title: string;
  description: string;
  category: string;
  game_type: string;
  game_config?: any;
  is_active: boolean;
}

interface ProgressItem {
  id: number;
  type: 'content' | 'cultural' | 'quiz' | 'game';
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  points_earned?: number;
  quizId?: number; // Store actual quiz ID for quiz steps
  gameId?: number; // Store actual game ID for game steps
}

interface LessonWorkflowClientProps {
  lessonId: number;
  userRole: string;
  userId: number;
}

export function LessonWorkflowClient({ lessonId, userRole, userId }: LessonWorkflowClientProps) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    fetchLessonData();
    fetchUserProgress();
  }, [lessonId, userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const fetchLessonData = async () => {
    try {
      const [lessonResponse, quizzesResponse, gamesResponse] = await Promise.all([
        fetch(`/api/lessons/${lessonId}`),
        fetch(`/api/lessons/${lessonId}/quizzes`),
        fetch(`/api/games?lessonId=${lessonId}`)
      ]);

      if (lessonResponse.ok) {
        const lessonData = await lessonResponse.json();
        setLesson(lessonData);
      }

      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData.filter((q: Quiz) => q.is_published));
      }

      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        setGames(gamesData.filter((g: Game) => g.is_active));
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`/api/student/progress/${userId}?lessonId=${lessonId}`);
      if (response.ok) {
        const progressData = await response.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const buildWorkflowSteps = (): ProgressItem[] => {
    const steps: ProgressItem[] = [];

    // Step 1: Lesson Content
    if (lesson?.content) {
      steps.push({
        id: 0,
        type: 'content',
        title: 'Lesson Content',
        status: 'not_started'
      });
    }

    // Step 2: Cultural Information
    if (lesson?.cultural_information) {
      steps.push({
        id: steps.length,
        type: 'cultural',
        title: 'Cultural Information',
        status: 'not_started'
      });
    }

    // Step 3: Quizzes
    quizzes.forEach((quiz, index) => {
      steps.push({
        id: steps.length,
        type: 'quiz',
        title: quiz.title,
        status: 'not_started',
        quizId: quiz.id // Store the actual quiz ID
      });
    });

    // Step 4: Games
    games.forEach((game, index) => {
      steps.push({
        id: steps.length,
        type: 'game',
        title: game.title,
        status: 'not_started',
        gameId: game.id // Store the actual game ID
      });
    });

    return steps;
  };

  const updateProgress = async (stepIndex: number, status: 'in_progress' | 'completed', score?: number) => {
    const step = buildWorkflowSteps()[stepIndex];
    if (!step) return;

    try {
      const response = await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: userId,
          lesson_id: lessonId,
          quiz_id: step.type === 'quiz' ? step.quizId : undefined,
          status,
          score,
          time_spent: timeSpent,
          points_earned: score ? Math.round((score / 100) * (step.type === 'quiz' ? quizzes.find(q => q.id === step.quizId)?.points_value || 0 : lesson?.points_value || 0)) : 0
        }),
      });

      if (response.ok) {
        // Update local progress state
        setProgress(prev => prev.map((item, index) => 
          index === stepIndex ? { ...item, status, score } : item
        ));
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNext = async () => {
    // Mark current step as completed
    await updateProgress(currentStep, 'completed');
    
    const steps = buildWorkflowSteps();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Mark next step as in progress
      await updateProgress(currentStep + 1, 'in_progress');
    } else {
      // Lesson completed
      setIsTimerRunning(false);
      setLessonCompleted(true);
      setShowCompletionModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinueToNextLesson = () => {
    // TODO: Navigate to next lesson or course
    // For now, just close the modal
    setShowCompletionModal(false);
  };

  const handleGoHome = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  const handleCloseModal = () => {
    setShowCompletionModal(false);
  };

  const renderCurrentStep = () => {
    const steps = buildWorkflowSteps();
    const currentStepData = steps[currentStep];

    if (!currentStepData) return null;

    switch (currentStepData.type) {
      case 'content':
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lesson Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {lesson?.content}
                      </pre>
                    </div>
                    <AudioPlayer 
                      text={lesson?.content || ''} 
                      language={lesson?.course_language || 'english'} 
                      size="md"
                      lessonId={lessonId}
                      type="content"
                      showSpeedControl={true}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'cultural':
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Cultural Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 whitespace-pre-wrap text-sm text-gray-700">
                      {lesson?.cultural_information}
                    </div>
                    <AudioPlayer 
                      text={lesson?.cultural_information || ''} 
                      language={lesson?.course_language || 'english'} 
                      size="md"
                      lessonId={lessonId}
                      type="cultural"
                      showSpeedControl={true}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'quiz':
        const quiz = quizzes.find(q => q.id === currentStepData.quizId);
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
          <InlineQuiz
            key={`quiz-${quiz.id}`} // Force remount when quiz changes
            quizId={quiz.id}
            onComplete={(score, passed) => {
              console.log(`Quiz completed: ${score}%, passed: ${passed}`);
              // Update progress when quiz is completed
              updateProgress(currentStep, 'completed', score);
            }}
            onNext={() => {
              // Move to next step when quiz is passed
              handleNext();
            }}
          />
        );

      case 'game':
        const game = games.find(g => g.id === currentStepData.gameId);
        if (!game) {
          return (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Game not found</h3>
                  <p className="text-gray-600">The game could not be loaded.</p>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <InlineGame
            key={`game-${game.id}`} // Force remount when game changes
            gameId={game.id}
            onComplete={(score, passed) => {
              console.log(`Game completed: ${score}%, passed: ${passed}`);
              // Update progress when game is completed
              updateProgress(currentStep, 'completed', score);
            }}
            onNext={() => {
              // Move to next step when game is completed
              handleNext();
            }}
          />
        );

      default:
        return null;
    }
  };

  const renderProgressSteps = () => {
    const steps = buildWorkflowSteps();
    const progressPercentage = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Lesson Progress</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
        </div>
        
        <Progress value={progressPercentage} className="mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-50'
                  : index < currentStep
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : index === currentStep ? (
                <Circle className="h-4 w-4 text-blue-600 fill-current" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
              <span className={`text-sm ${
                index === currentStep
                  ? 'text-blue-900 font-medium'
                  : index < currentStep
                  ? 'text-green-900'
                  : 'text-gray-600'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const steps = buildWorkflowSteps();
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/content/lessons/${lessonId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lesson
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson?.title}</h1>
            <p className="text-gray-600">Interactive Learning Session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {lesson?.points_value} pts
          </Badge>
        </div>
      </div>

      {/* Progress Steps */}
      {renderProgressSteps()}

      {/* Current Step Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={isLastStep && (steps[currentStep]?.status === 'completed' || lessonCompleted)}
        >
          {isLastStep ? 'Complete Lesson' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Lesson Completion Modal */}
      <LessonCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseModal}
        onContinue={handleContinueToNextLesson}
        onGoHome={handleGoHome}
        lessonTitle={lesson?.title || 'Lesson'}
        pointsEarned={lesson?.points_value || 0}
        hasNextLesson={true} // TODO: Check if there's a next lesson
      />
    </div>
  );
} 