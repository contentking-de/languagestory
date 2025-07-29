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
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  course_id: number;
  course_title: string;
}

export default function LessonEditPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    lesson_type: '',
    lesson_order: 1,
    estimated_duration: 30,
    points_value: 10,
    is_published: false,
  });

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`);
      if (response.ok) {
        const lessonData = await response.json();
        setLesson(lessonData);
        setFormData({
          title: lessonData.title,
          slug: lessonData.slug,
          description: lessonData.description || '',
          content: lessonData.content || '',
          lesson_type: lessonData.lesson_type,
          lesson_order: lessonData.lesson_order,
          estimated_duration: lessonData.estimated_duration || 30,
          points_value: lessonData.points_value || 10,
          is_published: lessonData.is_published,
        });
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/content/lessons/${lessonId}`);
      } else {
        console.error('Failed to update lesson');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
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

  if (!lesson) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
          <p className="text-gray-600 mb-4">The lesson you're trying to edit doesn't exist.</p>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/content/lessons/${lessonId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lesson</h1>
          <p className="text-gray-600 mt-1">
            Course: {lesson.course_title}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lesson Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Lesson Slug</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief description of the lesson..."
                />
              </div>

              <div>
                <Label htmlFor="content">Lesson Content</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  placeholder="Enter the lesson content here..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  The main content that students will see during the lesson
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lesson_type">Lesson Type</Label>
                  <Select 
                    value={formData.lesson_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, lesson_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lesson_order">Lesson Order</Label>
                  <Input
                    id="lesson_order"
                    type="number"
                    min="1"
                    value={formData.lesson_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, lesson_order: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="points">Points Value</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={formData.points_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, points_value: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Points students will earn for completing this lesson
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
                <Label htmlFor="published">Publish this lesson</Label>
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
                <Link href={`/dashboard/content/lessons/${lessonId}`}>
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