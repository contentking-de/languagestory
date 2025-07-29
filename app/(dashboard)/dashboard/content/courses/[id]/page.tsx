'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  BookOpen,
  Clock,
  Trophy,
  Users,
  Eye,
  Plus,
  GraduationCap,
  Play,
  Languages
} from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  language: string;
  level: string;
  is_published: boolean;
  total_lessons: number;
  total_points: number;
  estimated_duration: number;
  created_at: string;
  creator_name: string;
}

interface Lesson {
  id: number;
  title: string;
  lesson_type: string;
  lesson_order: number;
  estimated_duration: number;
  points_value: number;
  is_published: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const [courseResponse, lessonsResponse] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/lessons`)
      ]);

      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourse(courseData);
      }

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
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
      story: 'bg-blue-100 text-blue-800',
      game: 'bg-purple-100 text-purple-800',
      vocabulary: 'bg-green-100 text-green-800',
      grammar: 'bg-orange-100 text-orange-800',
      culture: 'bg-pink-100 text-pink-800',
      assessment: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      story: BookOpen,
      game: Play,
      vocabulary: Languages,
      grammar: GraduationCap,
      culture: Users,
      assessment: Trophy
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/dashboard/content/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/content/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">{getLanguageFlag(course.language)}</span>
              <span className="text-gray-600 capitalize">{course.language}</span>
              <Badge className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
              <div className={`w-2 h-2 rounded-full ${course.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${course.is_published ? 'text-green-600' : 'text-gray-500'}`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/content/courses/${course.id}/edit`}>
          <Button className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Course
          </Button>
        </Link>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold text-blue-600">{course.total_lessons}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-green-600">{course.total_points}</p>
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
                  {formatDuration(course.estimated_duration)}
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
                <p className="text-sm font-medium text-gray-600">Published Lessons</p>
                <p className="text-2xl font-bold text-orange-600">
                  {lessons.filter(l => l.is_published).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Lessons ({lessons.length})
              </CardTitle>
              <Link href={`/dashboard/content/lessons/create?courseId=${course.id}`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {lessons.length > 0 ? (
                <div className="space-y-3">
                  {lessons
                    .sort((a, b) => a.lesson_order - b.lesson_order)
                    .map((lesson) => {
                      const TypeIcon = getTypeIcon(lesson.lesson_type);
                      return (
                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                              <TypeIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <Badge className={getTypeColor(lesson.lesson_type)} variant="outline">
                                  {lesson.lesson_type}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(lesson.estimated_duration)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {lesson.points_value} pts
                                </span>
                                <div className={`w-2 h-2 rounded-full ${lesson.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <span className={lesson.is_published ? 'text-green-600' : 'text-gray-500'}>
                                  {lesson.is_published ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Link href={`/dashboard/content/lessons/${lesson.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/content/lessons/${lesson.id}/edit`}>
                              <Button size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
                  <p className="text-gray-600 mb-4">Start building your course by adding lessons.</p>
                  <Link href={`/dashboard/content/lessons/create?courseId=${course.id}`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Lesson
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">
                  {course.description || 'No description provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Creator</label>
                <p className="text-gray-900 mt-1">{course.creator_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(course.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Course Slug</label>
                <p className="text-gray-900 mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {course.slug}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 