'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Edit,
  BookOpen,
  Clock,
  Trophy,
  Users,
  Play,
  Languages,
  GraduationCap,
  FileQuestion,
  Plus,
  Image,
  Music,
  Video,
  Eye,
  Gamepad2
} from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  lesson_type: string;
  lesson_order: number;
  estimated_duration: number;
  points_value: number;
  is_published: boolean;
  created_at: string;
  course_id: number;
  course_title: string;
  course_language: string;
  course_level: string;
  cover_image?: string;
  audio_file?: string;
  video_file?: string;
  cultural_information?: string;
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
  language: string | null;
  difficulty_level: number;
  estimated_duration: number | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  usage_count: number;
  created_at: string;
}

interface LessonDetailClientProps {
  userRole: string;
}

export function LessonDetailClient({ userRole }: LessonDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user can create/edit lessons
  const canCreateEdit = userRole === 'super_admin' || userRole === 'content_creator';

  useEffect(() => {
    if (lessonId) {
      fetchLessonDetails();
    }
  }, [lessonId]);

  const fetchLessonDetails = async () => {
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
        setQuizzes(quizzesData);
      }

      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        setGames(gamesData);
      }
    } catch (error) {
      console.error('Error fetching lesson details:', error);
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
      reading: 'bg-blue-100 text-blue-800',
      listening: 'bg-green-100 text-green-800',
      speaking: 'bg-purple-100 text-purple-800',
      writing: 'bg-orange-100 text-orange-800',
      grammar: 'bg-red-100 text-red-800',
      vocabulary: 'bg-teal-100 text-teal-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      reading: BookOpen,
      listening: Play,
      speaking: Users,
      writing: Edit,
      grammar: Languages,
      vocabulary: GraduationCap
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getGameCategoryColor = (category: string) => {
    const colors = {
      vocabulary: 'bg-blue-100 text-blue-800',
      grammar: 'bg-green-100 text-green-800',
      listening: 'bg-purple-100 text-purple-800',
      speaking: 'bg-orange-100 text-orange-800',
      reading: 'bg-red-100 text-red-800',
      writing: 'bg-teal-100 text-teal-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (!lesson) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
          <p className="text-gray-600 mb-4">The lesson you're looking for doesn't exist.</p>
          <Link href="/dashboard/content/lessons">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(lesson.lesson_type);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/content/lessons">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">{getLanguageFlag(lesson.course_language)}</span>
              <Link href={`/dashboard/content/courses/${lesson.course_id}`} className="text-gray-600 hover:text-gray-900">
                {lesson.course_title}
              </Link>
              <Badge className={getLevelColor(lesson.course_level)}>
                {lesson.course_level}
              </Badge>
              <Badge className={getTypeColor(lesson.lesson_type)}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {lesson.lesson_type}
              </Badge>
              <div className={`w-2 h-2 rounded-full ${lesson.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${lesson.is_published ? 'text-green-600' : 'text-gray-500'}`}>
                {lesson.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
        {canCreateEdit && (
          <Link href={`/dashboard/content/lessons/${lesson.id}/edit`}>
            <Button className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Lesson
            </Button>
          </Link>
        )}
      </div>

      {/* Lesson Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lesson Order</p>
                <p className="text-2xl font-bold text-blue-600">#{lesson.lesson_order}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Value</p>
                <p className="text-2xl font-bold text-green-600">{lesson.points_value}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatDuration(lesson.estimated_duration)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quizzes</p>
                <p className="text-2xl font-bold text-orange-600">{quizzes.length}</p>
              </div>
              <FileQuestion className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Files */}
      {(lesson.cover_image || lesson.audio_file || lesson.video_file) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Media Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cover Image */}
              {lesson.cover_image && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Cover Image</Label>
                  <div className="relative">
                    <img
                      src={lesson.cover_image}
                      alt="Lesson cover"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => window.open(lesson.cover_image, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Audio File */}
              {lesson.audio_file && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Audio File</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Audio</span>
                    </div>
                    <audio controls className="w-full">
                      <source src={lesson.audio_file} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              {/* Video File */}
              {lesson.video_file && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Video File</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Video</span>
                    </div>
                    <video controls className="w-full rounded">
                      <source src={lesson.video_file} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content & Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lesson Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lesson.content ? (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {lesson.content}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
                  <p className="text-gray-600 mb-4">
                    {canCreateEdit 
                      ? 'This lesson doesn\'t have content yet.'
                      : 'This lesson doesn\'t have content yet.'
                    }
                  </p>
                  {canCreateEdit && (
                    <Link href={`/dashboard/content/lessons/${lesson.id}/edit`}>
                      <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cultural Information */}
          {lesson.cultural_information && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Cultural Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="whitespace-pre-wrap text-sm text-gray-700">
                      {lesson.cultural_information}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quizzes Section */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                Lesson Quizzes ({quizzes.length})
              </CardTitle>
              {canCreateEdit && (
                <Link href={`/dashboard/content/quizzes/create?lessonId=${lesson.id}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Quiz
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {quizzes.length > 0 ? (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                          <FileQuestion className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <Badge className={getTypeColor(quiz.quiz_type)} variant="outline">
                              {quiz.quiz_type}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {quiz.points_value} pts
                            </span>
                            <div className={`w-2 h-2 rounded-full ${quiz.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className={quiz.is_published ? 'text-green-600' : 'text-gray-500'}>
                              {quiz.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/content/quizzes/${quiz.id}`}>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canCreateEdit && (
                          <Link href={`/dashboard/content/quizzes/${quiz.id}/edit`}>
                            <Button size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
                  <p className="text-gray-600 mb-4">
                    {canCreateEdit 
                      ? 'Add quizzes to test student understanding.'
                      : 'This lesson doesn\'t have any quizzes yet.'
                    }
                  </p>
                  {canCreateEdit && (
                    <Link href={`/dashboard/content/quizzes/create?lessonId=${lesson.id}`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Quiz
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Games Section */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Lesson Games ({games.length})
              </CardTitle>
              {canCreateEdit && (
                <Link href={`/dashboard/games?lessonId=${lesson.id}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Game
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {games.length > 0 ? (
                <div className="space-y-3">
                  {games.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                          <Gamepad2 className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{game.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                            {game.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <Badge className={getGameCategoryColor(game.category)} variant="outline">
                              {game.category}
                            </Badge>
                            <Badge className={getDifficultyColor(game.difficulty_level)} variant="outline">
                              Level {game.difficulty_level}
                            </Badge>
                            {game.estimated_duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(game.estimated_duration)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {game.usage_count} plays
                            </span>
                            <div className={`w-2 h-2 rounded-full ${game.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className={game.is_active ? 'text-green-600' : 'text-gray-500'}>
                              {game.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/dashboard/games/${game.id}`}>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canCreateEdit && (
                          <Link href={`/dashboard/games/${game.id}/edit`}>
                            <Button size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No games yet</h3>
                  <p className="text-gray-600 mb-4">
                    {canCreateEdit 
                      ? 'Add interactive games to make learning more engaging.'
                      : 'This lesson doesn\'t have any games yet.'
                    }
                  </p>
                  {canCreateEdit && (
                    <Link href={`/dashboard/games?lessonId=${lesson.id}`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Game
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">
                  {lesson.description || 'No description provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Course</label>
                <Link href={`/dashboard/content/courses/${lesson.course_id}`} className="block mt-1">
                  <div className="flex items-center gap-2 text-gray-900 hover:text-orange-600">
                    <span className="text-lg">{getLanguageFlag(lesson.course_language)}</span>
                    <span>{lesson.course_title}</span>
                  </div>
                </Link>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(lesson.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Lesson Slug</label>
                <p className="text-gray-900 mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {lesson.slug}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Content Length</label>
                <p className="text-gray-900 mt-1">
                  {lesson.content ? `${lesson.content.length} characters` : 'No content'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 