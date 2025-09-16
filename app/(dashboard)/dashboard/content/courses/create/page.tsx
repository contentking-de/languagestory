'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Loader2,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FlagIcon } from '@/components/ui/flag-icon';
import DifficultyLevelSelect from '@/components/ui/difficulty-level-select';

export default function CreateCoursePage() {
  const router = useRouter();
  
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    language: '',
    level: '',
    is_published: false,
    estimated_duration: 60,
  });

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
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCourse = await response.json();
        router.push(`/dashboard/content/courses/${newCourse.id}`);
      } else {
        console.error('Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setCreating(false);
    }
  };

  const isFormValid = formData.title && formData.slug && formData.language && formData.level;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/content/courses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-1">
            Add a new language learning course to your platform
          </p>
        </div>
      </div>

      {/* Creation Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="mt-1"
                  placeholder="e.g., Beginner French Conversation"
                />
              </div>

              <div>
                <Label htmlFor="slug">Course Slug *</Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  className="mt-1 font-mono"
                  placeholder="beginner-french-conversation"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used in the course URL (auto-generated from title)
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe what students will learn in this course..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language *</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                                      <SelectItem value="french">
                  <div className="flex items-center gap-2">
                    <FlagIcon language="french" size="sm" />
                    <span>French</span>
                  </div>
                </SelectItem>
                <SelectItem value="german">
                  <div className="flex items-center gap-2">
                    <FlagIcon language="german" size="sm" />
                    <span>German</span>
                  </div>
                </SelectItem>
                <SelectItem value="spanish">
                  <div className="flex items-center gap-2">
                    <FlagIcon language="spanish" size="sm" />
                    <span>Spanish</span>
                  </div>
                </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <DifficultyLevelSelect
                    id="level"
                    label="Difficulty Level *"
                    required
                    value={formData.level as any}
                    onChange={(dbLevel) => setFormData(prev => ({ ...prev, level: dbLevel }))}
                    placeholder="Select level"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                  placeholder="60"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Total estimated time to complete the course
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
                <Label htmlFor="published">Publish this course immediately</Label>
                <p className="text-sm text-gray-500">
                  (You can also publish it later)
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your course will be created with the basic information</li>
                  <li>• You can then add lessons, quizzes, and other content</li>
                  <li>• Students will be able to enroll once published</li>
                </ul>
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
                      Create Course
                    </>
                  )}
                </Button>
                <Link href="/dashboard/content/courses">
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