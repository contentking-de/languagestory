'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Plus,
  Loader2,
  Languages
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
  course_title: string;
  course_language: string;
  course_level: string;
}

export default function VocabularyCreatePage() {
  const router = useRouter();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    word_french: '',
    word_german: '',
    word_spanish: '',
    word_english: '',
    pronunciation: '',
    phonetic: '',
    audio_file: '',
    image_file: '',
    context_sentence: '',
    cultural_note: '',
    difficulty_level: 1,
    word_type: '',
    lesson_id: undefined as number | undefined,
    topic_id: undefined as number | undefined,
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons/simple');
      if (response.ok) {
        const lessonsData = await response.json();
        setLessons(lessonsData);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newVocabulary = await response.json();
        router.push(`/dashboard/content/vocabulary/${newVocabulary.id}`);
      } else {
        console.error('Failed to create vocabulary');
      }
    } catch (error) {
      console.error('Error creating vocabulary:', error);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/content/vocabulary">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Vocabulary</h1>
          <p className="text-gray-600 mt-1">
            Create a new vocabulary word with translations and context
          </p>
        </div>
      </div>

      {/* Create Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Vocabulary Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Translations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="word_english">English Word *</Label>
                  <Input
                    id="word_english"
                    type="text"
                    value={formData.word_english}
                    onChange={(e) => setFormData(prev => ({ ...prev, word_english: e.target.value }))}
                    required
                    className="mt-1"
                    placeholder="English translation"
                  />
                </div>

                <div>
                  <Label htmlFor="word_french">French Word</Label>
                  <Input
                    id="word_french"
                    type="text"
                    value={formData.word_french}
                    onChange={(e) => setFormData(prev => ({ ...prev, word_french: e.target.value }))}
                    className="mt-1"
                    placeholder="French translation"
                  />
                </div>

                <div>
                  <Label htmlFor="word_german">German Word</Label>
                  <Input
                    id="word_german"
                    type="text"
                    value={formData.word_german}
                    onChange={(e) => setFormData(prev => ({ ...prev, word_german: e.target.value }))}
                    className="mt-1"
                    placeholder="German translation"
                  />
                </div>

                <div>
                  <Label htmlFor="word_spanish">Spanish Word</Label>
                  <Input
                    id="word_spanish"
                    type="text"
                    value={formData.word_spanish}
                    onChange={(e) => setFormData(prev => ({ ...prev, word_spanish: e.target.value }))}
                    className="mt-1"
                    placeholder="Spanish translation"
                  />
                </div>
              </div>

              {/* Pronunciation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pronunciation">Pronunciation Guide</Label>
                  <Input
                    id="pronunciation"
                    type="text"
                    value={formData.pronunciation}
                    onChange={(e) => setFormData(prev => ({ ...prev, pronunciation: e.target.value }))}
                    className="mt-1"
                    placeholder="How to pronounce"
                  />
                </div>

                <div>
                  <Label htmlFor="phonetic">Phonetic Spelling</Label>
                  <Input
                    id="phonetic"
                    type="text"
                    value={formData.phonetic}
                    onChange={(e) => setFormData(prev => ({ ...prev, phonetic: e.target.value }))}
                    className="mt-1"
                    placeholder="/fəˈnetɪk/"
                  />
                </div>
              </div>

              {/* Context and Notes */}
              <div>
                <Label htmlFor="context_sentence">Context Sentence</Label>
                <textarea
                  id="context_sentence"
                  value={formData.context_sentence}
                  onChange={(e) => setFormData(prev => ({ ...prev, context_sentence: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Example sentence using this word..."
                />
              </div>

              <div>
                <Label htmlFor="cultural_note">Cultural Note</Label>
                <textarea
                  id="cultural_note"
                  value={formData.cultural_note}
                  onChange={(e) => setFormData(prev => ({ ...prev, cultural_note: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Cultural context or interesting facts..."
                />
              </div>

              {/* Word Type and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="word_type">Word Type</Label>
                  <Select 
                    value={formData.word_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, word_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select word type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noun">📦 Noun</SelectItem>
                      <SelectItem value="verb">⚡ Verb</SelectItem>
                      <SelectItem value="adjective">🎨 Adjective</SelectItem>
                      <SelectItem value="adverb">⚡ Adverb</SelectItem>
                      <SelectItem value="preposition">🔗 Preposition</SelectItem>
                      <SelectItem value="conjunction">🔗 Conjunction</SelectItem>
                      <SelectItem value="interjection">❗ Interjection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <Select 
                    value={formData.difficulty_level.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(value) }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 ★☆☆☆☆</SelectItem>
                      <SelectItem value="2">Level 2 ★★☆☆☆</SelectItem>
                      <SelectItem value="3">Level 3 ★★★☆☆</SelectItem>
                      <SelectItem value="4">Level 4 ★★★★☆</SelectItem>
                      <SelectItem value="5">Level 5 ★★★★★</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lesson Assignment */}
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
                  Assign this vocabulary word to a specific lesson for better organization
                </p>
              </div>

              {/* Media Files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="audio_file">Audio File URL</Label>
                  <Input
                    id="audio_file"
                    type="url"
                    value={formData.audio_file}
                    onChange={(e) => setFormData(prev => ({ ...prev, audio_file: e.target.value }))}
                    className="mt-1"
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                <div>
                  <Label htmlFor="image_file">Image File URL</Label>
                  <Input
                    id="image_file"
                    type="url"
                    value={formData.image_file}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_file: e.target.value }))}
                    className="mt-1"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Tips for Adding Vocabulary</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>English Word:</strong> This is required and will be the primary identifier</li>
                  <li>• <strong>Translations:</strong> Add translations in any languages you teach</li>
                  <li>• <strong>Context Sentence:</strong> Show learners how to use the word in real situations</li>
                  <li>• <strong>Cultural Notes:</strong> Add interesting facts that help remember the word</li>
                  <li>• <strong>Lesson Assignment:</strong> Connect words to lessons for structured learning</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Vocabulary
                    </>
                  )}
                </Button>
                <Link href="/dashboard/content/vocabulary">
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