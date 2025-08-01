'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { logGameActivity } from '@/lib/activity-logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  Play,
  ExternalLink,
  BookOpen,
  Calendar,
  Globe,
  Star,
  Clock,
  Users,
  Tag,
  Trash2,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface DatabaseGame {
  id: number;
  title: string;
  description: string;
  original_url: string;
  normalized_url: string;
  embed_html: string;
  thumbnail_url: string | null;
  author_name: string | null;
  author_url: string | null;
  provider_name: string;
  provider_url: string;
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

interface GameDetailClientProps {
  userRole: string;
}

export function GameDetailClient({ userRole }: GameDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const [game, setGame] = useState<DatabaseGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Check if user can create/edit games
  const canCreateEdit = userRole === 'super_admin' || userRole === 'content_creator';

  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/games/wordwall/${gameId}`);
      if (response.ok) {
        const gameData = await response.json();
        setGame(gameData);
        
        // Log that user played/viewed a game
        logGameActivity('PLAY_GAME');
      } else {
        console.error('Failed to fetch game');
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/games/wordwall/${gameId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/dashboard/games');
      } else {
        console.error('Failed to delete game');
        alert('Failed to delete game. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game. Please try again.');
    } finally {
      setDeleting(false);
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

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Quiz': '🎯',
      'Vocabulary': '📚',
      'Grammar': '📝',
      'Reading': '📖',
      'Mathematics': '🔢',
      'Science': '🔬',
      'History': '🏛️',
      'General': '🎮'
    };
    return icons[category] || '🎮';
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800',
      5: 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyStars = (level: number) => {
    return '⭐'.repeat(level);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'No limit';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
          <p className="text-gray-600 mb-4">The game you're looking for doesn't exist.</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/games">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{game.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {game.author_name && (
                <span className="text-gray-600">by {game.author_name}</span>
              )}
              <Badge className={getDifficultyColor(game.difficulty_level)}>
                {getDifficultyStars(game.difficulty_level)}
              </Badge>
              <Badge variant="outline">
                {getCategoryIcon(game.category)} {game.category}
              </Badge>
              {game.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <a 
            href={game.original_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Game
            </Button>
          </a>
          {canCreateEdit && (
            <>
              <Link href={`/dashboard/games/${game.id}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Embed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Game Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {game.embed_html ? (
                <div 
                  className="w-full bg-gray-100 rounded-lg overflow-hidden"
                  style={{ 
                    minHeight: game.height ? `${game.height}px` : '400px',
                    maxHeight: '600px'
                  }}
                  dangerouslySetInnerHTML={{ __html: game.embed_html }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Game embed not available</p>
                    <a 
                      href={game.original_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{game.description}</p>
            </CardContent>
          </Card>

          {/* Tags */}
          {game.tags && game.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Game Information */}
          <Card>
            <CardHeader>
              <CardTitle>Game Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">{getCategoryIcon(game.category)}</span>
                  <span className="text-gray-900">{game.category}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Difficulty Level</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getDifficultyColor(game.difficulty_level)}>
                    {getDifficultyStars(game.difficulty_level)}
                  </Badge>
                  <span className="text-sm text-gray-600">Level {game.difficulty_level}</span>
                </div>
              </div>

              {game.estimated_duration && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Estimated Duration</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{formatDuration(game.estimated_duration)}</span>
                  </div>
                </div>
              )}

              {game.language && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Language</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{getLanguageFlag(game.language)}</span>
                    <span className="text-gray-900 capitalize">{game.language}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Usage Count</label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{game.usage_count} times</span>
                </div>
              </div>

              {game.lesson_title && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Lesson</label>
                  <Link href={`/dashboard/content/lessons/${game.lesson_id}`} className="block mt-1">
                    <div className="flex items-center gap-2 text-gray-900 hover:text-orange-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{game.lesson_title}</span>
                    </div>
                  </Link>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(game.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(game.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Provider</label>
                <p className="text-gray-900 mt-1">{game.provider_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Dimensions</label>
                <p className="text-gray-900 mt-1">
                  {game.width && game.height ? `${game.width} × ${game.height}px` : 'Not specified'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${game.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className={`text-sm ${game.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                    {game.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {game.author_name && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Author</label>
                  <div className="mt-1">
                    <p className="text-gray-900">{game.author_name}</p>
                    {game.author_url && (
                      <a 
                        href={game.author_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 