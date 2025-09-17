'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  Trophy,
  Play,
  Users,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
}

interface LessonsClientProps {
  userRole: string;
}

export function LessonsClient({ userRole }: LessonsClientProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check if user can create/edit lessons
  const canCreateEdit = userRole === 'super_admin' || userRole === 'content_creator';

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter((lesson: Lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || lesson.course_language === languageFilter;
    const matchesType = typeFilter === 'all' || lesson.lesson_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && lesson.is_published) ||
                         (statusFilter === 'draft' && !lesson.is_published);

    return matchesSearch && matchesLanguage && matchesType && matchesStatus;
  });

  const getLanguageFlag = (language: string) => {
    const flags = {
      french: '🇫🇷',
      german: '🇩🇪',
      spanish: '🇪🇸'
    };
    return flags[language as keyof typeof flags] || '🌐';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      story: BookOpen,
      game: Play,
      vocabulary: Users,
      grammar: GraduationCap,
      quiz: BookOpen,
      conversation: Users
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      story: 'bg-blue-100 text-blue-800',
      game: 'bg-green-100 text-green-800',
      vocabulary: 'bg-purple-100 text-purple-800',
      grammar: 'bg-orange-100 text-orange-800',
      quiz: 'bg-red-100 text-red-800',
      conversation: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const uniqueCourses = [...new Set(lessons.map(l => l.course_id))].length;
  const uniqueTypes = [...new Set(lessons.map(l => l.lesson_type))];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {canCreateEdit ? 'Lesson Management' : 'Lessons Overview'}
          </h1>
          <p className="text-gray-600 mt-1">
            {canCreateEdit 
              ? 'Manage individual lessons and learning activities across all courses'
              : 'Browse and view individual lessons and learning activities across all courses'
            }
          </p>
        </div>
        {canCreateEdit && (
          <Link href="/dashboard/content/lessons/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Lesson
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {lessons.filter((l: Lesson) => l.is_published).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-blue-600">{uniqueCourses}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lesson Types</p>
                <p className="text-2xl font-bold text-purple-600">{uniqueTypes.length}</p>
              </div>
              <Play className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search lessons or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="french">🇫🇷 French</SelectItem>
                <SelectItem value="german">🇩🇪 German</SelectItem>
                <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="game">Game</SelectItem>
                <SelectItem value="vocabulary">Vocabulary</SelectItem>
                <SelectItem value="grammar">Grammar</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="conversation">Conversation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-900">Lesson</th>
                  <th className="text-left p-3 font-medium text-gray-900">Course</th>
                  <th className="text-left p-3 font-medium text-gray-900">Type</th>
                  <th className="text-left p-3 font-medium text-gray-900">Duration</th>
                  <th className="text-left p-3 font-medium text-gray-900">Points</th>
                  <th className="text-left p-3 font-medium text-gray-900">Status</th>
                  <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => {
                  const TypeIcon = getTypeIcon(lesson.lesson_type);
                  return (
                    <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <Link href={`/dashboard/content/lessons/${lesson.id}`}>
                              <h3 className="font-medium text-gray-900 line-clamp-1 hover:text-blue-600 hover:underline cursor-pointer transition-colors flex items-center gap-1 group">
                                {lesson.title}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                              {lesson.description || 'No description'}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              Order: {lesson.lesson_order}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getLanguageFlag(lesson.course_language)}</span>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{lesson.course_title}</p>
                            <Badge className={`${getLevelColor(lesson.course_level)} text-xs`}>
                              {lesson.course_level}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getTypeColor(lesson.lesson_type)}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {lesson.lesson_type}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{formatDuration(lesson.estimated_duration || 0)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Trophy className="h-4 w-4" />
                          <span className="text-sm">{lesson.points_value}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${lesson.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className={`text-sm ${lesson.is_published ? 'text-green-600' : 'text-gray-500'}`}>
                            {lesson.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Link href={`/dashboard/content/lessons/${lesson.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canCreateEdit && (
                            <Link href={`/dashboard/content/lessons/${lesson.id}/edit`}>
                              <Button size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                      {canCreateEdit && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (!confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`)) return;
                            try {
                              const res = await fetch(`/api/lessons/${lesson.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                setLessons(prev => prev.filter(l => l.id !== lesson.id));
                              } else {
                                const e = await res.json().catch(() => ({}));
                                alert(e.error || 'Failed to delete lesson');
                              }
                            } catch (e) {
                              alert('Failed to delete lesson');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredLessons.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || languageFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more lessons.'
                : 'Get started by creating your first lesson.'}
            </p>
            {canCreateEdit && (
              <Link href="/dashboard/content/lessons/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Lesson
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 