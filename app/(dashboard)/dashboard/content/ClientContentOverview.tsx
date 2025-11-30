'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  GraduationCap, 
  FileQuestion, 
  Languages,
  TrendingUp,
  Users,
  Clock,
  Trophy,
  Plus,
  ArrowRight,
  BarChart3,
  Brain
} from 'lucide-react';
import Link from 'next/link';

interface ContentStats {
  totalCourses: number;
  totalLessons: number;
  totalQuizzes: number;
  totalVocabulary: number;
  publishedCourses: number;
  publishedLessons: number;
  languageStats: { language: string; courses: number; flag: string }[];
  recentContent: {
    id: number;
    title: string;
    type: string;
    language: string;
    created_at: string;
  }[];
}

export default function ClientContentOverview() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentStats();
  }, []);

  const fetchContentStats = async () => {
    try {
      const response = await fetch('/api/content/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching content stats:', error);
    } finally {
      setLoading(false);
    }
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

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Failed to load content statistics</div>
      </div>
    );
  }

  const totalContent = stats.totalCourses + stats.totalLessons + stats.totalQuizzes;
  const publishedContent = stats.publishedCourses + stats.publishedLessons;
  const publishedPercentage = totalContent > 0 ? Math.round((publishedContent / totalContent) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">
            Overview of all your language learning content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{totalContent}</p>
                <p className="text-xs text-gray-500 mt-1">{publishedPercentage}% published</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCourses}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.publishedCourses} published</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalLessons}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.publishedLessons} published</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assessments</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalQuizzes}</p>
                <p className="text-xs text-gray-500 mt-1">Quizzes & tests</p>
              </div>
              <FileQuestion className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/dashboard/ai-creator">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">AI Creator</h3>
                    <p className="text-sm text-gray-600">Generate content with AI</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/content/courses">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Courses</h3>
                    <p className="text-sm text-gray-600">Create and edit courses</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/content/lessons">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Lessons</h3>
                    <p className="text-sm text-gray-600">View and edit lessons</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/content/quizzes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileQuestion className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Quizzes</h3>
                    <p className="text-sm text-gray-600">Create assessments</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/content/vocabulary">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Languages className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Vocabulary</h3>
                    <p className="text-sm text-gray-600">Manage word lists</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Language Breakdown & Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Language Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.languageStats.map((lang) => (
                <div key={lang.language} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium capitalize">{lang.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(lang.courses / stats.totalCourses) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{lang.courses}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentContent.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.type === 'course' && <GraduationCap className="h-4 w-4 text-blue-500" />}
                      {item.type === 'lesson' && <BookOpen className="h-4 w-4 text-green-500" />}
                      {item.type === 'quiz' && <FileQuestion className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {item.type} • {item.language}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Quality</p>
                <p className="text-2xl font-bold text-green-600">{publishedPercentage}%</p>
                <p className="text-xs text-gray-500 mt-1">Ready for students</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Course Size</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalCourses > 0 ? Math.round(stats.totalLessons / stats.totalCourses) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Lessons per course</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vocabulary Bank</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalVocabulary}</p>
                <p className="text-xs text-gray-500 mt-1">Words & phrases</p>
              </div>
              <Languages className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


