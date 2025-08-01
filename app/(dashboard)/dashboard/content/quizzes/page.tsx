'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileQuestion, 
  Search, 
  Plus,
  Eye,
  Edit,
  Clock,
  Trophy,
  Target,
  BookOpen,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  question_count?: number;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quiz.lesson_title && quiz.lesson_title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || quiz.quiz_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && quiz.is_published) ||
                         (statusFilter === 'draft' && !quiz.is_published);
    const matchesLanguage = languageFilter === 'all' || quiz.course_language === languageFilter;
    const matchesLesson = lessonFilter === 'all' || 
                         (lessonFilter === 'assigned' && quiz.lesson_id) ||
                         (lessonFilter === 'unassigned' && !quiz.lesson_id);

    return matchesSearch && matchesType && matchesStatus && matchesLanguage && matchesLesson;
  });

  const getLanguageFlag = (language: string) => {
    const flags = {
      french: '🇫🇷',
      german: '🇩🇪',
      spanish: '🇪🇸'
    };
    return flags[language as keyof typeof flags] || '🌐';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      multiple_choice: 'bg-blue-100 text-blue-800',
      gap_fill: 'bg-green-100 text-green-800',
      true_false: 'bg-yellow-100 text-yellow-800',
      // Legacy types
      comprehension: 'bg-blue-100 text-blue-800',
      vocabulary: 'bg-green-100 text-green-800',
      grammar: 'bg-orange-100 text-orange-800',
      listening: 'bg-purple-100 text-purple-800',
      speaking: 'bg-pink-100 text-pink-800',
      writing: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      multiple_choice: '🔘',
      gap_fill: '📝',
      true_false: '✅',
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return 'No limit';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const uniqueTypes = [...new Set(quizzes.map(q => q.quiz_type))];
  const averagePassRate = quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q.pass_percentage, 0) / quizzes.length) : 0;
  const assignedQuizzes = quizzes.filter(q => q.lesson_id).length;

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
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600 mt-1">
            Manage quizzes, assessments, and learning evaluations
          </p>
        </div>
        <Link href="/dashboard/content/quizzes/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
              <FileQuestion className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {quizzes.filter(q => q.is_published).length}
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
                <p className="text-sm font-medium text-gray-600">Avg. Pass Rate</p>
                <p className="text-2xl font-bold text-blue-600">{averagePassRate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned to Lessons</p>
                <p className="text-2xl font-bold text-purple-600">{assignedQuizzes}</p>
                <p className="text-xs text-gray-500">{quizzes.length - assignedQuizzes} unassigned</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
                          <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="multiple_choice">🔘 Multiple Choice</SelectItem>
              <SelectItem value="gap_fill">📝 Gap Fill</SelectItem>
              <SelectItem value="true_false">✅ True or False</SelectItem>
              <SelectItem value="comprehension">Comprehension</SelectItem>
              <SelectItem value="vocabulary">Vocabulary</SelectItem>
              <SelectItem value="grammar">Grammar</SelectItem>
              <SelectItem value="listening">Listening</SelectItem>
              <SelectItem value="speaking">Speaking</SelectItem>
              <SelectItem value="writing">Writing</SelectItem>
            </SelectContent>
            </Select>

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

            <Select value={lessonFilter} onValueChange={setLessonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lesson Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                <SelectItem value="assigned">📚 Assigned to Lesson</SelectItem>
                <SelectItem value="unassigned">⚠️ Not Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                                              <Badge className={getTypeColor(quiz.quiz_type)}>
                            {getTypeIcon(quiz.quiz_type)} {quiz.quiz_type.replace(/_/g, ' ')}
                          </Badge>
                    {quiz.course_language && (
                      <span className="text-lg">{getLanguageFlag(quiz.course_language)}</span>
                    )}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${quiz.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {quiz.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
              )}

              {quiz.lesson_title ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="truncate">
                    <strong>Lesson:</strong> {quiz.lesson_title}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="truncate">
                    <em>No lesson assigned</em>
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{quiz.pass_percentage}% pass</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(quiz.time_limit)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Trophy className="h-4 w-4" />
                  <span>{quiz.points_value} points</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{quiz.max_attempts} attempts</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm">
                <span className={`${quiz.is_published ? 'text-green-600' : 'text-gray-500'}`}>
                  {quiz.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/dashboard/content/quizzes/${quiz.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
                <Link href={`/dashboard/content/quizzes/${quiz.id}/edit`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || languageFilter !== 'all' || lessonFilter !== 'all'
                ? 'Try adjusting your filters to see more quizzes.'
                : 'Get started by creating your first quiz.'}
            </p>
            <Link href="/dashboard/content/quizzes/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 