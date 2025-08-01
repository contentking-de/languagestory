'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Loader2,
  FileQuestion
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  lesson_id?: number;
  lesson_title?: string;
}

interface Lesson {
  id: number;
  title: string;
  course_title: string;
  course_language: string;
  course_level: string;
}

export default function QuizEditPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quiz_type: '',
    lesson_id: undefined as number | undefined,
    pass_percentage: 70,
    time_limit: 0,
    max_attempts: 0,
    points_value: 10,
    is_published: false,
  });

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
      fetchLessons();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);

        // Parse description to extract actual description
        let actualDescription = '';
        try {
          const parsed = JSON.parse(quizData.description || '{}');
          if (parsed.description !== undefined) {
            actualDescription = parsed.description;
          } else {
            actualDescription = quizData.description || '';
          }
        } catch (error) {
          actualDescription = quizData.description || '';
        }

        setFormData({
          title: quizData.title,
          description: actualDescription,
          quiz_type: quizData.quiz_type,
          lesson_id: quizData.lesson_id,
          pass_percentage: quizData.pass_percentage || 70,
          time_limit: quizData.time_limit || 0,
          max_attempts: quizData.max_attempts || 0,
          points_value: quizData.points_value || 10,
          is_published: quizData.is_published,
        });
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons/simple');
      if (response.ok) {
        const lessonsData = await response.json();
        setLessons(lessonsData);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/content/quizzes/${quizId}`);
      } else {
        console.error('Failed to update quiz');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
    } finally {
      setSaving(false);
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

  if (!quiz) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz not found</h2>
          <p className="text-gray-600 mb-4">The quiz you're trying to edit doesn't exist.</p>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/content/quizzes/${quizId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
          <p className="text-gray-600 mt-1">
            {quiz.lesson_title && `Lesson: ${quiz.lesson_title}`}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief description of the quiz..."
                />
              </div>

              <div>
                <Label htmlFor="lesson_id">Assign to Lesson</Label>
                <Select 
                  value={formData.lesson_id ? formData.lesson_id.toString() : 'unassigned'} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    lesson_id: value === 'unassigned' ? undefined : parseInt(value) 
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No lesson assigned</SelectItem>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        {lesson.title} ({lesson.course_language} - {lesson.course_title})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Assign this quiz to a specific lesson for better organization
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quiz_type">Quiz Type</Label>
                  <Select 
                    value={formData.quiz_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, quiz_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehension">Comprehension</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="listening">Listening</SelectItem>
                      <SelectItem value="speaking">Speaking</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pass_percentage">Passing Percentage</Label>
                  <Input
                    id="pass_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pass_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, pass_percentage: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum percentage needed to pass (0-100%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="0"
                    value={formData.time_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set to 0 for no time limit
                  </p>
                </div>

                <div>
                  <Label htmlFor="max_attempts">Max Attempts</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    min="0"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set to 0 for unlimited attempts
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="points_value">Points Value</Label>
                <Input
                  id="points_value"
                  type="number"
                  min="0"
                  value={formData.points_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, points_value: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Points students will earn for completing this quiz
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <Label htmlFor="published">Publish this quiz</Label>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Quiz Settings Guide</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Passing Percentage:</strong> Students must score this percentage to pass</li>
                  <li>• <strong>Time Limit:</strong> Maximum time allowed to complete the quiz</li>
                  <li>• <strong>Max Attempts:</strong> How many times students can retake the quiz</li>
                  <li>• <strong>Points Value:</strong> Total points awarded for completing the quiz</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Link href={`/dashboard/content/quizzes/${quizId}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 