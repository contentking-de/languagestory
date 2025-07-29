'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Clock,
  Trophy,
  Target,
  Globe,
  School,
  GraduationCap
} from 'lucide-react';

interface AnalyticsData {
  totalCourses: number;
  totalLessons: number;
  totalQuizzes: number;
  totalInstitutions: number;
  totalUsers: number;
  publishedContent: number;
  languageBreakdown: { language: string; count: number; flag: string }[];
  institutionTypes: { type: string; count: number }[];
  contentTypes: { type: string; count: number }[];
  monthlyGrowth: { month: string; courses: number; lessons: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Failed to load analytics data</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive insights into your language learning platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalCourses + analytics.totalLessons + analytics.totalQuizzes}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.publishedContent}% published
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Institutions</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalInstitutions}</p>
                <p className="text-xs text-gray-500 mt-1">Educational partners</p>
              </div>
              <School className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-green-600">{analytics.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Platform users</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Languages</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.languageBreakdown.length}</p>
                <p className="text-xs text-gray-500 mt-1">Available languages</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.totalCourses / (analytics.totalCourses + analytics.totalLessons + analytics.totalQuizzes)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analytics.totalCourses}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.totalLessons / (analytics.totalCourses + analytics.totalLessons + analytics.totalQuizzes)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analytics.totalLessons}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.totalQuizzes / (analytics.totalCourses + analytics.totalLessons + analytics.totalQuizzes)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analytics.totalQuizzes}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.languageBreakdown.map((lang) => (
                <div key={lang.language} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium capitalize">{lang.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(lang.count / analytics.totalCourses) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{lang.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institution Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Institution Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {analytics.institutionTypes.map((type) => (
              <div key={type.type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{type.count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {type.type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lesson Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analytics.contentTypes.map((type) => (
              <div key={type.type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{type.count}</div>
                <div className="text-sm text-gray-600 capitalize">{type.type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Quality</p>
                <p className="text-2xl font-bold text-green-600">{analytics.publishedContent}%</p>
                <p className="text-xs text-gray-500 mt-1">Published content</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Course Size</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(analytics.totalLessons / analytics.totalCourses)}
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
                <p className="text-sm font-medium text-gray-600">Assessment Ratio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((analytics.totalQuizzes / analytics.totalLessons) * 100)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Quizzes to lessons</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 