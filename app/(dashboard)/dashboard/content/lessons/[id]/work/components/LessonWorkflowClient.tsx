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
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { AudioPlayer } from '@/components/ui/audio-player';
import { InlineQuiz } from './InlineQuiz';
import { InlineGame } from './InlineGame';
import InlineGrammar from './InlineGrammar';
import InlineVocabTrainer, { LessonVocabularyItem } from './InlineVocabTrainer';
import { LessonCompletionModal } from '@/components/lesson-completion-modal';

interface Lesson {
  id: number;
  title: string;
  content: string;
  cultural_information?: string;
  cover_image?: string;
  course_language: string;
  points_value: number;
  course_id?: number;
  lesson_order?: number;
  course_title?: string;
  flow_order?: any;
  vocabulary?: LessonVocabularyItem[];
  stories?: Array<{ id: number; title: string; content: string }>;
  grammar?: Array<{ id: number; title: string; exercises: any[] }>;
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
  type: 'content' | 'cultural' | 'quiz' | 'game' | 'story' | 'grammar';
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  points_earned?: number;
  quizId?: number; // Store actual quiz ID for quiz steps
  gameId?: number; // Store actual game ID for game steps
  storyId?: number;
  grammarId?: number;
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
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [hasNextLesson, setHasNextLesson] = useState(true);
  const [showProgressSteps, setShowProgressSteps] = useState(false);

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
        fetch(`/api/lessons/${lessonId}/games`)
      ]);

      if (lessonResponse.ok) {
        const lessonData = await lessonResponse.json();
        setLesson(lessonData);
      }

      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        // Include all quizzes; flow_order may reference drafts explicitly
        setQuizzes(quizzesData);
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

  const fetchNextLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/next`);
      if (response.ok) {
        const data = await response.json();
        setNextLesson(data.nextLesson);
        setHasNextLesson(!!data.nextLesson);
      }
    } catch (error) {
      console.error('Error fetching next lesson:', error);
      setHasNextLesson(false);
    }
  };

  const buildWorkflowSteps = (): ProgressItem[] => {
    // If a flow_order exists on the lesson, use it to drive ordering
    const items: Array<{ key: string; type: 'content' | 'cultural' | 'quiz' | 'game' | 'vocab'; id?: number; title?: string }> = Array.isArray(lesson?.flow_order) ? lesson!.flow_order : [];
    const steps: ProgressItem[] = [];
    const addedQuizIds = new Set<number>();
    const addedGameIds = new Set<number>();
    const addedGrammarIds = new Set<number>();
    let contentAdded = false;
    let culturalAdded = false;
    let vocabAdded = false;
    const addVocab = () => {
      if (lesson?.vocabulary && lesson.vocabulary.length > 0) {
        steps.push({ id: steps.length, type: 'content', title: 'Vocabulary Trainer', status: 'not_started' } as any);
        vocabAdded = true;
      }
    };

    const addContent = () => {
      if (lesson?.content) {
        steps.push({ id: steps.length, type: 'content', title: 'Lesson Content', status: 'not_started' });
        contentAdded = true;
      }
    };
    const addStories = () => {
      if (lesson?.stories && lesson.stories.length > 0) {
        for (const s of lesson.stories) {
          steps.push({ id: steps.length, type: 'story', title: s.title || 'Short Story', status: 'not_started', storyId: s.id });
        }
      }
    };
    const addGrammar = () => {
      if (lesson?.grammar && lesson.grammar.length > 0) {
        for (const g of lesson.grammar) {
          steps.push({ id: steps.length, type: 'grammar', title: g.title || 'Grammar', status: 'not_started', grammarId: g.id } as any);
          addedGrammarIds.add(g.id as number);
        }
      }
    };
    const addCultural = () => {
      if (lesson?.cultural_information) {
        steps.push({ id: steps.length, type: 'cultural', title: 'Cultural Information', status: 'not_started' });
        culturalAdded = true;
      }
    };
    const addQuizById = (qid?: number) => {
      if (!qid) return;
      const quiz = quizzes.find(q => q.id === qid);
      if (quiz && !addedQuizIds.has(quiz.id)) {
        steps.push({ id: steps.length, type: 'quiz', title: quiz.title, status: 'not_started', quizId: quiz.id });
        addedQuizIds.add(quiz.id);
      }
    };
    const addGameById = (gid?: number) => {
      if (!gid) return;
      const game = games.find(g => g.id === gid);
      if (game && !addedGameIds.has(game.id)) {
        steps.push({ id: steps.length, type: 'game', title: game.title, status: 'not_started', gameId: game.id });
        addedGameIds.add(game.id);
      }
    };
    const addGrammarById = (gid?: number) => {
      if (!gid) return;
      const gram = lesson?.grammar?.find(g => g.id === gid);
      if (gram && !addedGrammarIds.has(gram.id as number)) {
        steps.push({ id: steps.length, type: 'grammar', title: gram.title || 'Grammar', status: 'not_started', grammarId: gram.id } as any);
        addedGrammarIds.add(gram.id as number);
      }
    };

    if (items.length > 0) {
      const hasVocabInOrder = items.some((it) => it.type === 'vocab');
      for (const it of items) {
        if (it.type === 'content') addContent();
        else if (it.type === 'vocab') addVocab();
        else if (it.type === 'cultural') addCultural();
        else if (it.type === 'quiz') addQuizById(it.id);
        else if (it.type === 'game') addGameById(it.id);
        else if ((it as any).type === 'grammar') addGrammarById(it.id);
      }
      // Ensure vocab appears if the lesson has vocabulary but flow_order omitted it
      if (!hasVocabInOrder && lesson?.vocabulary && lesson.vocabulary.length > 0 && !vocabAdded) {
        steps.unshift({ id: -1, type: 'content', title: 'Vocabulary Trainer', status: 'not_started' } as any);
        vocabAdded = true;
      }
      // Append any missing core content blocks not explicitly referenced in flow_order
      if (lesson?.content && !contentAdded) addContent();
      if (lesson?.cultural_information && !culturalAdded) addCultural();
      // Always include stories if present (not currently addressable by flow_order)
      addStories();
      // Append any quizzes/games/grammar not present in flow_order
      quizzes.forEach(q => { if (!addedQuizIds.has(q.id)) addQuizById(q.id); });
      games.forEach(g => { if (!addedGameIds.has(g.id)) addGameById(g.id); });
      if (lesson?.grammar && lesson.grammar.length > 0) {
        lesson.grammar.forEach(g => { if (!addedGrammarIds.has(g.id as number)) addGrammarById(g.id); });
      }
      // Normalize step IDs after potential unshift
      return steps.map((s, idx) => ({ ...s, id: idx }));
    }

    // Fallback default order if no saved order exists
    addVocab();
    addContent();
    addStories();
    addGrammar();
    addCultural();
    quizzes.forEach(q => addQuizById(q.id));
    games.forEach(g => addGameById(g.id));
    return steps.map((s, idx) => ({ ...s, id: idx }));
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
      // Fetch next lesson information
      fetchNextLesson();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinueToNextLesson = () => {
    if (nextLesson) {
      // Navigate to the next lesson
      window.location.href = `/dashboard/content/lessons/${nextLesson.id}/work`;
    } else {
      // No next lesson available, go to dashboard
      window.location.href = '/dashboard';
    }
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
        if (currentStepData.title === 'Vocabulary Trainer' && lesson?.vocabulary && lesson.vocabulary.length > 0) {
          return (
            <InlineVocabTrainer
              words={lesson.vocabulary}
              targetLanguage={(lesson.course_language as any) || 'english'}
              onComplete={() => updateProgress(currentStep, 'completed', 100)}
              onNext={handleNext}
            />
          );
        }
        // fall through to normal content rendering
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
                    {lesson?.cover_image && (
                      <img
                        src={lesson.cover_image}
                        alt="Lesson image"
                        className="rounded-md w-56 h-56 md:w-64 md:h-64 object-cover flex-shrink-0"
                      />
                    )}
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
      case 'story':
        const story = lesson?.stories?.find(s => s.id === currentStepData.storyId);
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {story?.title || 'Short Story'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 whitespace-pre-wrap text-sm text-gray-700">
                      {story?.content}
                    </div>
                    <AudioPlayer 
                      text={story?.content || ''} 
                      language={lesson?.course_language || 'english'} 
                      size="md"
                      lessonId={lessonId}
                      type="story"
                      topicId={story?.id}
                      uniqueId={story ? `story-${story.id}` : undefined}
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
          <>
            {(() => {
              const showContentPre = quiz?.quiz_type === 'multiple_choice' && !!lesson?.content;
              const showCulturalPre = quiz?.quiz_type === 'true_false' && !!lesson?.cultural_information;
              if (!showContentPre && !showCulturalPre) return null;
              return (
                <div className="mx-auto mb-6 max-w-4xl">
                  {showContentPre && (
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Lesson Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <div className="bg-gray-50 p-4 rounded-lg h-full">
                            <div className="flex items-start gap-3">
                              {lesson?.cover_image && (
                                <img
                                  src={lesson.cover_image}
                                  alt="Lesson image"
                                  className="rounded-md w-56 h-56 md:w-64 md:h-64 object-cover flex-shrink-0"
                                />
                              )}
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
                  )}
                  {showCulturalPre && (
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Languages className="h-5 w-5" />
                          Cultural Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 h-full">
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
                  )}
                </div>
              );
            })()}

            <InlineQuiz
              key={`quiz-${quiz.id}`} // Force remount when quiz changes
              quizId={quiz.id}
              lessonLanguage={lesson?.course_language}
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
          </>
        );

      case 'grammar':
        const gram = lesson?.grammar?.find(g => g.id === currentStepData.grammarId);
        if (!gram) return null;
        return (
          <InlineGrammar
            key={`grammar-${gram.id}`}
            topicId={gram.id}
            title={gram.title}
            exercises={gram.exercises || []}
            onComplete={(s, passed) => updateProgress(currentStep, 'completed', s)}
            onNext={handleNext}
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

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Lesson Steps</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded-md border text-xs ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-50'
                  : index < currentStep
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
              ) : index === currentStep ? (
                <Circle className="h-3 w-3 text-blue-600 fill-current flex-shrink-0" />
              ) : (
                <Circle className="h-3 w-3 text-gray-400 flex-shrink-0" />
              )}
              <span className={`truncate ${
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
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link href={`/dashboard/content/lessons/${lessonId}`}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lesson
            </Button>
          </Link>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{lesson?.title}</h1>
            <p className="text-sm sm:text-base text-gray-600">Interactive Learning Session</p>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {lesson?.points_value} pts
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Lesson Progress</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <Progress value={steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0} className="h-2" />
      </div>

      {/* Current Step Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={isLastStep && (steps[currentStep]?.status === 'completed' || lessonCompleted)}
          className="w-full sm:w-auto order-3"
        >
          {isLastStep ? 'Complete Lesson' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Progress Steps Toggle */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <Button
          variant="ghost"
          onClick={() => setShowProgressSteps(!showProgressSteps)}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <span className="text-sm">
            {showProgressSteps ? 'Hide' : 'Show'} Detailed Steps ({steps.length} total)
          </span>
          {showProgressSteps ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        
        {showProgressSteps && (
          <div className="mt-4">
            {renderProgressSteps()}
          </div>
        )}
      </div>

      {/* Lesson Completion Modal */}
      <LessonCompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseModal}
        onContinue={handleContinueToNextLesson}
        onGoHome={handleGoHome}
        lessonTitle={lesson?.title || 'Lesson'}
        pointsEarned={lesson?.points_value || 0}
        hasNextLesson={hasNextLesson}
      />
    </div>
  );
} 