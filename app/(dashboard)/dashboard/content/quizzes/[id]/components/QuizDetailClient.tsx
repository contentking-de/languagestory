'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  FileQuestion,
  Clock,
  Trophy,
  Target,
  Users,
  Plus,
  BookOpen,
  Play,
  CheckCircle,
  AlertCircle
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
  is_published: boolean;
  created_at: string;
  lesson_id?: number;
  topic_id?: number;
  lesson_title?: string;
  course_title?: string;
  course_language?: string;
  course_level?: string;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  correct_answer: string;
  answer_options: any;
}

interface QuizDetailClientProps {
  userRole: string;
}

export function QuizDetailClient({ userRole }: QuizDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user can create/edit quizzes
  const canCreateEdit = userRole === 'super_admin' || userRole === 'content_creator';

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const fetchQuizDetails = async () => {
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
      console.error('Error fetching quiz details:', error);
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

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      multiple_choice: 'bg-blue-100 text-blue-800',
      true_false: 'bg-green-100 text-green-800',
      gap_fill: 'bg-purple-100 text-purple-800',
      matching: 'bg-orange-100 text-orange-800',
      short_answer: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getQuestionTypeIcon = (type: string) => {
    const icons = {
      multiple_choice: FileQuestion,
      true_false: CheckCircle,
      gap_fill: Edit,
      matching: Target,
      short_answer: AlertCircle
    };
    return icons[type as keyof typeof icons] || FileQuestion;
  };

  const getQuestionTypeColor = (type: string) => {
    const colors = {
      multiple_choice: 'bg-blue-100 text-blue-800',
      true_false: 'bg-green-100 text-green-800',
      gap_fill: 'bg-purple-100 text-purple-800',
      matching: 'bg-orange-100 text-orange-800',
      short_answer: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'No limit';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileQuestion className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist.</p>
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

  // Parse quiz configuration from description if it exists
  let quizConfig: any = {};
  let actualDescription = '';
  
  try {
    if (quiz.description && quiz.description.includes('"quiz_config"')) {
      const configMatch = quiz.description.match(/"quiz_config":\s*({[^}]+})/);
      if (configMatch) {
        quizConfig = JSON.parse(configMatch[1]);
        actualDescription = quiz.description.replace(/.*"quiz_config":\s*{[^}]+}.*/s, '').trim();
      }
    }
  } catch (error) {
    console.error('Error parsing quiz config:', error);
  }

  if (!actualDescription) {
    actualDescription = quiz.description || '';
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/content/quizzes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {quiz.course_language && (
                <>
                  <span className="text-lg">{getLanguageFlag(quiz.course_language)}</span>
                  {quiz.lesson_title && (
                    <Link href={`/dashboard/content/lessons/${quiz.lesson_id}`} className="text-gray-600 hover:text-gray-900">
                      {quiz.lesson_title}
                    </Link>
                  )}
                  {quiz.course_title && (
                    <span className="text-gray-600">in {quiz.course_title}</span>
                  )}
                  {quiz.course_level && (
                    <Badge className={getLevelColor(quiz.course_level)}>
                      {quiz.course_level}
                    </Badge>
                  )}
                </>
              )}
              <Badge className={getTypeColor(quiz.quiz_type)}>
                <FileQuestion className="h-3 w-3 mr-1" />
                {quiz.quiz_type}
              </Badge>
              <div className={`w-2 h-2 rounded-full ${quiz.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${quiz.is_published ? 'text-green-600' : 'text-gray-500'}`}>
                {quiz.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
        {canCreateEdit && (
          <Link href={`/dashboard/content/quizzes/${quiz.id}/edit`}>
            <Button className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Quiz
            </Button>
          </Link>
        )}
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
              </div>
              <FileQuestion className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Value</p>
                <p className="text-2xl font-bold text-green-600">{quiz.points_value}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-purple-600">{quiz.pass_percentage}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Limit</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatDuration(quiz.time_limit).replace('No limit', '∞')}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Content & Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                Quiz Questions ({questions.length})
              </CardTitle>
              {canCreateEdit && (
                <Link href={`/dashboard/content/quizzes/${quiz.id}/questions/create`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const TypeIcon = getQuestionTypeIcon(question.question_type);
                    return (
                      <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div>
                              <Badge className={getQuestionTypeColor(question.question_type)} variant="outline">
                                <TypeIcon className="h-3 w-3 mr-1" />
                                {question.question_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Trophy className="h-4 w-4" />
                            <span>{question.points} pts</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-gray-900 font-medium">{question.question_text}</p>
                        </div>

                        {question.answer_options && question.question_type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.answer_options.map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className="flex items-center gap-2 text-sm">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  option === question.correct_answer 
                                    ? 'border-green-500 bg-green-100' 
                                    : 'border-gray-300'
                                }`}>
                                  {option === question.correct_answer && (
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  )}
                                </div>
                                <span className={option === question.correct_answer ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.question_type === 'true_false' && (
                          <div className="text-sm text-gray-600">
                            Correct answer: <span className="font-medium text-green-700">{question.correct_answer}</span>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          {canCreateEdit && (
                            <Link href={`/dashboard/content/quizzes/${quiz.id}/questions/${question.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}
                          <Link href={`/dashboard/content/quizzes/${quiz.id}/preview`}>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {quiz.quiz_type === 'gap_fill' ? (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Questions should be auto-generated</h3>
                      <p className="text-gray-600 mb-4">
                        Gap fill questions should be automatically created from your text with [BLANK] markers. 
                        If you don't see questions here, please check your gap fill configuration.
                      </p>
                      <div className="flex gap-3 justify-center">
                        {canCreateEdit && (
                          <Link href={`/dashboard/content/quizzes/${quiz.id}/edit`}>
                            <Button variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Check Gap Fill Settings
                            </Button>
                          </Link>
                        )}
                        <Link href={`/dashboard/content/quizzes/${quiz.id}/preview`}>
                          <Button>
                            <Play className="h-4 w-4 mr-2" />
                            Preview Quiz
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                      <p className="text-gray-600 mb-4">
                        {canCreateEdit 
                          ? 'Add questions to make this quiz interactive.'
                          : 'This quiz doesn\'t have any questions yet.'
                        }
                      </p>
                      {canCreateEdit && (
                        <Link href={`/dashboard/content/quizzes/${quiz.id}/questions/create`}>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Question
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">
                  {actualDescription || 'No description provided'}
                </p>
              </div>

              {/* Quiz Type Specific Configuration */}
              {quiz.quiz_type === 'multiple_choice' && quizConfig.multiple_choice && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🔘 Multiple Choice Settings</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Questions: <span className="font-medium">{quizConfig.multiple_choice.num_questions}</span></div>
                    <div>Options: <span className="font-medium">{quizConfig.multiple_choice.num_options} per question</span></div>
                    <div>Randomize: <span className="font-medium">{quizConfig.multiple_choice.randomize_options ? 'Yes' : 'No'}</span></div>
                    <div>Multi-select: <span className="font-medium">{quizConfig.multiple_choice.multiple_correct ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              )}

              {quiz.quiz_type === 'gap_fill' && quizConfig.gap_fill && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">📝 Gap Fill Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div>Gaps: <span className="font-medium">{quizConfig.gap_fill.num_gaps}</span></div>
                    <div>Difficulty: <span className="font-medium capitalize">{quizConfig.gap_fill.difficulty}</span></div>
                    <div>Hints: <span className="font-medium">{quizConfig.gap_fill.allow_hints ? 'Enabled' : 'Disabled'}</span></div>
                    {quizConfig.gap_fill.text_content && (
                      <div>
                        <span className="font-medium">Text Preview:</span>
                        <p className="text-gray-700 mt-1 p-2 bg-white rounded border text-xs">
                          {quizConfig.gap_fill.text_content.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                    {quizConfig.gap_fill.word_bank && (
                      <div>
                        <span className="font-medium">Word Bank:</span>
                        <p className="text-gray-700 mt-1">{quizConfig.gap_fill.word_bank}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {quiz.quiz_type === 'true_false' && quizConfig.true_false && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">✅ True/False Settings</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Questions: <span className="font-medium">{quizConfig.true_false.num_questions}</span></div>
                    <div>Explanations: <span className="font-medium">{quizConfig.true_false.show_explanations ? 'Yes' : 'No'}</span></div>
                    <div>Randomize: <span className="font-medium">{quizConfig.true_false.randomize_order ? 'Yes' : 'No'}</span></div>
                    <div>Immediate feedback: <span className="font-medium">{quizConfig.true_false.immediate_feedback ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              )}

              {quiz.lesson_title && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Lesson</label>
                  <Link href={`/dashboard/content/lessons/${quiz.lesson_id}`} className="block mt-1">
                    <div className="text-gray-900 hover:text-orange-600">
                      {quiz.lesson_title}
                    </div>
                  </Link>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Quiz Type</label>
                <p className="text-gray-900 mt-1 capitalize">{quiz.quiz_type.replace('_', ' ')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Passing Percentage</label>
                <p className="text-gray-900 mt-1">{quiz.pass_percentage}%</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Time Limit</label>
                <p className="text-gray-900 mt-1">{formatDuration(quiz.time_limit)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Max Attempts</label>
                <p className="text-gray-900 mt-1">
                  {quiz.max_attempts === 0 ? 'Unlimited' : quiz.max_attempts}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Total Questions</label>
                <p className="text-gray-900 mt-1">{questions.length}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Total Points</label>
                <p className="text-gray-900 mt-1">
                  {questions.reduce((sum, q) => sum + q.points, 0)} (Quiz worth {quiz.points_value})
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 