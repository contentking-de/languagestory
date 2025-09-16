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
  Gamepad2,
  Target
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CefrDifficultySelect from '@/components/ui/cefr-difficulty-select';
import { GameConfigEditor, getConfigKeyForType } from '../../components/GameConfigEditors';

interface DatabaseGame {
  id: number;
  title: string;
  description: string;
  game_type: string;
  game_config?: any;
  original_url?: string;
  normalized_url?: string;
  embed_html?: string;
  thumbnail_url: string | null;
  author_name: string | null;
  author_url: string | null;
  provider_name: string;
  provider_url?: string;
  width: number | null;
  height: number | null;
  category: string;
  language: string | null;
  difficulty_level: number;
  estimated_duration: number | null;
  lesson_id?: number;
  lesson_title?: string;
  course_title?: string;
  course_language?: string;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  added_by: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface Lesson {
  id: number;
  title: string;
  course_title: string;
  course_language: string;
  course_level: string;
}

export default function GameEditPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const [game, setGame] = useState<DatabaseGame | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game_type: '',
    game_config: null as any,
    category: '',
    language: '',
    difficulty_level: 1,
    estimated_duration: undefined as number | undefined,
    lesson_id: undefined as number | undefined,
    tags: [] as string[],
    is_featured: false,
  });

  useEffect(() => {
    if (gameId) {
      fetchGame();
      fetchLessons();
    }
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      if (response.ok) {
        const gameData = await response.json();
        setGame(gameData);
        setFormData({
          title: gameData.title || '',
          description: gameData.description || '',
          game_type: gameData.game_type || 'wordwall',
          game_config: gameData.game_config || null,
          category: gameData.category || '',
          language: gameData.language || '',
          difficulty_level: gameData.difficulty_level || 1,
          estimated_duration: gameData.estimated_duration,
          lesson_id: gameData.lesson_id,
          tags: gameData.tags || [],
          is_featured: gameData.is_featured || false,
        });
      }
    } catch (error) {
      console.error('Error fetching game:', error);
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
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/games/${gameId}`);
      } else {
        console.error('Failed to update game');
        alert('Failed to update game. Please try again.');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Failed to update game. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
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

  if (!game) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Game not found</h2>
          <p className="text-gray-600 mb-4">The game you're trying to edit doesn't exist.</p>
          <Link href="/dashboard/games">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
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
        <Link href={`/dashboard/games/${gameId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Game</h1>
          <p className="text-gray-600 mt-1">
            {game.lesson_title && `Lesson: ${game.lesson_title}`}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Game Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Game Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="mt-1"
                    placeholder="Enter game title"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe the game and what students will learn..."
                  />
                </div>

                <div>
                  <Label htmlFor="game_type">Game Type</Label>
                  <Select 
                    value={formData.game_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, game_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select game type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wordwall">🎮 Wordwall</SelectItem>
                      <SelectItem value="memory">🧠 Memory</SelectItem>
                      <SelectItem value="hangman">🎯 Hangman</SelectItem>
                      <SelectItem value="word_search">🔍 Word Search</SelectItem>
                      <SelectItem value="flashcards">📝 Flashcards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vocabulary">📚 Vocabulary</SelectItem>
                      <SelectItem value="grammar">📝 Grammar</SelectItem>
                      <SelectItem value="quiz">❓ Quiz</SelectItem>
                      <SelectItem value="matching">🔗 Matching</SelectItem>
                      <SelectItem value="french">🇫🇷 French</SelectItem>
                      <SelectItem value="german">🇩🇪 German</SelectItem>
                      <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="english">🇬🇧 English</SelectItem>
                      <SelectItem value="math">🔢 Math</SelectItem>
                      <SelectItem value="science">🔬 Science</SelectItem>
                      <SelectItem value="history">📜 History</SelectItem>
                      <SelectItem value="geography">🌍 Geography</SelectItem>
                      <SelectItem value="general">🎮 General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={formData.language || 'unspecified'} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      language: value === 'unspecified' ? '' : value 
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unspecified">Not specified</SelectItem>
                      <SelectItem value="french">🇫🇷 French</SelectItem>
                      <SelectItem value="german">🇩🇪 German</SelectItem>
                      <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="english">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <CefrDifficultySelect
                    id="difficulty_level"
                    label="Difficulty Level"
                    value={formData.difficulty_level}
                    onChange={(val) => setFormData(prev => ({ ...prev, difficulty_level: val }))}
                    placeholder="Select difficulty"
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.estimated_duration || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estimated_duration: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="mt-1"
                    placeholder="e.g., 15"
                  />
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
                  Assign this game to a specific lesson for better organization
                </p>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="mt-1"
                  placeholder="vocabulary, beginner, colors (comma-separated)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add tags to help categorize and search for this game
                </p>
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <input
                  id="is_featured"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                />
                <Label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Featured Game
                </Label>
                <p className="text-sm text-gray-500">
                  Featured games appear prominently in the games list
                </p>
              </div>

              {/* Editable Game Configuration */}
              {formData.game_type !== 'wordwall' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Game Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const key = getConfigKeyForType(formData.game_type);
                      if (!key) return <div>Select a game type</div>;
                      const cfg = formData.game_config ? (formData.game_config as any)[key] : undefined;
                      return (
                        <GameConfigEditor
                          gameType={formData.game_type}
                          config={cfg}
                          onChange={(updated) => {
                            const next = { ...(formData.game_config || {}) } as any;
                            next[key] = updated;
                            setFormData(prev => ({ ...prev, game_config: next }));
                          }}
                        />
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Game Information</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Game Type:</strong> {game.game_type || 'wordwall'}</p>
                  <p><strong>Provider:</strong> {game.provider_name}</p>
                  <p><strong>Author:</strong> {game.author_name || 'Unknown'}</p>
                  <p><strong>Usage Count:</strong> {game.usage_count} times</p>
                  <p><strong>Added:</strong> {new Date(game.created_at).toLocaleDateString()}</p>
                  {game.original_url && <p><strong>Original URL:</strong> {game.original_url}</p>}
                </div>
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
                <Link href={`/dashboard/games/${gameId}`}>
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