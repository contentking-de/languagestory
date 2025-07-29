'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Info
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Course {
  id: number;
  title: string;
  language: string;
  level: string;
}

export default function CreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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
    course_id: preselectedCourseId ? parseInt(preselectedCourseId) : 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/simple');
      if (response.ok) {
        const coursesData = await response.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
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
    setCreating(true);

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newLesson = await response.json();
        router.push(`/dashboard/content/lessons/${newLesson.id}`);
      } else {
        console.error('Failed to create lesson');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
    } finally {
      setCreating(false);
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

  const selectedCourse = courses.find(c => c.id === formData.course_id);
  const isFormValid = formData.title && formData.slug && formData.lesson_type && formData.course_id > 0;

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
      <div className="flex items-center gap-4">
        <Link href="/dashboard/content/lessons">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Lesson</h1>
          <p className="text-gray-600 mt-1">
            Add a new lesson to your language learning course
          </p>
        </div>
      </div>

      {/* Creation Form */}
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
              {/* Course Selection */}
              <div>
                <Label htmlFor="course">Course *</Label>
                <Select 
                  value={formData.course_id.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: parseInt(value) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{getLanguageFlag(course.language)}</span>
                          <span>{course.title}</span>
                          <span className="text-xs text-gray-500">({course.level})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourse && (
                  <p className="text-sm text-gray-600 mt-1">
                    Adding lesson to: {getLanguageFlag(selectedCourse.language)} {selectedCourse.title} ({selectedCourse.level})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                    className="mt-1"
                    placeholder="e.g., Introduction to French Greetings"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Lesson Slug *</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="mt-1 font-mono"
                    placeholder="introduction-to-french-greetings"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-generated from title
                  </p>
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
                  placeholder="Brief description of what students will learn..."
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
                  placeholder="Enter the lesson content here... You can add text, instructions, examples, etc."
                />
                <p className="text-sm text-gray-500 mt-1">
                  The main content that students will see during the lesson
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lesson_type">Lesson Type *</Label>
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
                    placeholder="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Position in the course
                  </p>
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
                    placeholder="30"
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
                  placeholder="10"
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
                <Label htmlFor="published">Publish this lesson immediately</Label>
                <p className="text-sm text-gray-500">
                  (You can also publish it later)
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your lesson will be added to the selected course</li>
                    <li>• You can add quizzes and interactive elements</li>
                    <li>• Students will see it in their course progression</li>
                    <li>• You can reorder lessons within the course later</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={creating || !isFormValid}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Lesson
                    </>
                  )}
                </Button>
                <Link href="/dashboard/content/lessons">
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