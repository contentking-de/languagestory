'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Gamepad2,
  Plus,
  Search,
  Play,
  ExternalLink,
  Loader2,
  Users,
  Star,
  Clock,
  BookOpen,
  Filter,
  Globe,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { CreateGameModal } from './CreateGameModal';
import { MemoryGame, HangmanGame, FlashcardsGame, WordSearchGame, WordMixupGame, WordAssociationGame } from './GameRenderers';

interface DatabaseGame {
  id: number;
  title: string;
  description: string;
  game_type: string;
  original_url?: string;
  normalized_url?: string;
  embed_html?: string;
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
  game_config?: any;
  is_active: boolean;
  is_featured: boolean;
  added_by: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface WordwallGame {
  version: string;
  type: string;
  width: number;
  height: number;
  title: string;
  html: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  original_url?: string;
  success?: boolean;
  error?: string;
}

interface Lesson {
  id: number;
  title: string;
  course_title: string;
  course_language: string;
  course_level: string;
}

interface GamesClientProps {
  userRole: string;
}

export function GamesClient({ userRole }: GamesClientProps) {
  const [games, setGames] = useState<DatabaseGame[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Removed Wordwall creation states
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [assigningLesson, setAssigningLesson] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Render-Optimierung: Nur das geöffnete Select rendert sein Content-Portals
  const [openSelectForGameId, setOpenSelectForGameId] = useState<number | null>(null);

  // Check if user can create/edit games
  const canCreateEdit = userRole === 'super_admin' || userRole === 'content_creator';

  // Removed sample games loader for production cleanliness

  // Load games from database on component mount
  useEffect(() => {
    loadGamesFromDatabase();
    loadLessons();
  }, []);

  const loadGamesFromDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      } else {
        console.error('Failed to load games');
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        setLessons(data);
      } else {
        console.error('Failed to load lessons');
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const assignLessonToGame = async (gameId: number, lessonId: number | null) => {
    try {
      setAssigningLesson(gameId);
      const response = await fetch(`/api/games/wordwall/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lesson_id: lessonId }),
      });
      
      if (response.ok) {
        // Reload games to get updated data
        loadGamesFromDatabase();
      } else {
        console.error('Failed to assign lesson to game');
      }
    } catch (error) {
      console.error('Error assigning lesson to game:', error);
    } finally {
      setAssigningLesson(null);
    }
  };

  // loadSampleGames removed

  // addGameFromUrl removed

  // addGame removed

  // testUrl removed

  const incrementGameUsage = async (gameId: number) => {
    try {
      await fetch(`/api/games/wordwall/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usage_count: 1 }),
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const toggleGameExpanded = (index: number) => {
    setExpandedGame(expandedGame === index ? null : index);
  };

  const getGameCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('quiz') || lowerTitle.includes('test')) return 'Quiz';
    if (lowerTitle.includes('word') || lowerTitle.includes('vocabulary')) return 'Vocabulary';
    if (lowerTitle.includes('grammar') || lowerTitle.includes('sentence')) return 'Grammar';
    if (lowerTitle.includes('reading') || lowerTitle.includes('comprehension')) return 'Reading';
    if (lowerTitle.includes('math') || lowerTitle.includes('number')) return 'Mathematics';
    if (lowerTitle.includes('science') || lowerTitle.includes('biology')) return 'Science';
    if (lowerTitle.includes('history') || lowerTitle.includes('social')) return 'History';
    return 'General';
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Quiz': 'bg-blue-100 text-blue-800',
      'Vocabulary': 'bg-green-100 text-green-800',
      'Grammar': 'bg-purple-100 text-purple-800',
      'Reading': 'bg-orange-100 text-orange-800',
      'Mathematics': 'bg-red-100 text-red-800',
      'Science': 'bg-teal-100 text-teal-800',
      'History': 'bg-yellow-100 text-yellow-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getLanguageFlag = (language: string) => {
    const flags = {
      french: '🇫🇷',
      german: '🇩🇪',
      spanish: '🇪🇸'
    };
    return flags[language as keyof typeof flags] || '🌐';
  };

  // Filter games based on search term and filters
  const filteredGames = games.filter(game => {
    const matchesSearch = !searchTerm || 
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (game.author_name && game.author_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
    
    const matchesLesson = lessonFilter === 'all' || 
      (lessonFilter === 'assigned' && game.lesson_id) ||
      (lessonFilter === 'unassigned' && !game.lesson_id);
    
    return matchesSearch && matchesCategory && matchesLesson;
  });

  const uniqueCategories = [...new Set(games.map(game => game.category))];
  const uniqueAuthors = [...new Set(games.map(game => game.author_name).filter(Boolean))];
  const totalUsage = games.reduce((sum, game) => sum + game.usage_count, 0);
  const featuredGames = games.filter(game => game.is_featured);
  const assignedGames = games.filter(game => game.lesson_id).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
            {canCreateEdit ? 'Educational Games Library' : 'Educational Games Overview'}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {canCreateEdit 
              ? 'Manage and organize interactive learning games'
              : 'Browse and play interactive learning games'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button
            onClick={() => loadGamesFromDatabase()}
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          {canCreateEdit && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Game
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Games</p>
                <p className="text-2xl font-bold text-indigo-600">{games.length}</p>
              </div>
              <Gamepad2 className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-blue-600">{uniqueCategories.length}</p>
              </div>
              <Filter className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plays</p>
                <p className="text-2xl font-bold text-green-600">{totalUsage}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned to Lessons</p>
                <p className="text-2xl font-bold text-yellow-600">{assignedGames}</p>
                <p className="text-xs text-gray-500">{games.length - assignedGames} unassigned</p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Search Games</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Lesson Assignment</label>
              <Select value={lessonFilter} onValueChange={setLessonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="assigned">📚 Assigned to Lesson</SelectItem>
                  <SelectItem value="unassigned">⚠️ Not Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setLessonFilter('all');
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wordwall creation removed */}

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredGames.length} of {games.length} games
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGames.map((game, index) => {
              const isExpanded = expandedGame === index;
              return (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{game.title}</CardTitle>
                        {game.author_name && (
                          <p className="text-sm text-gray-600 mt-1">by {game.author_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {game.is_featured && (
                          <Star className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(game.category)}`}>
                          {getCategoryIcon(game.category)} {game.category}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Game Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          toggleGameExpanded(index);
                          incrementGameUsage(game.id);
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isExpanded ? 'Hide Game' : 'Play Game'}
                      </Button>
                      {game.game_type === 'wordwall' && game.original_url && (
                        <a href={game.original_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Wordwall
                          </Button>
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/games/${game.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      {canCreateEdit && (
                        <>
                          <Link href={`/dashboard/games/${game.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this game?')) {
                                try {
                                  const response = await fetch(`/api/games?id=${game.id}`, {
                                    method: 'DELETE'
                                  });
                                  if (response.ok) {
                                    loadGamesFromDatabase(); // Reload the games list
                                  } else {
                                    alert('Failed to delete game');
                                  }
                                } catch (error) {
                                  console.error('Error deleting game:', error);
                                  alert('Failed to delete game');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Lesson Assignment */}
                    {canCreateEdit && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Assign to Lesson</label>
                          {game.lesson_title && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              ✓ Assigned
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={game.lesson_id?.toString() || 'none'}
                            onValueChange={(value) => {
                              const lessonId = value === 'none' ? null : parseInt(value);
                              assignLessonToGame(game.id, lessonId);
                            }}
                            open={openSelectForGameId === game.id}
                            onOpenChange={(isOpen) => setOpenSelectForGameId(isOpen ? game.id : null)}
                            disabled={assigningLesson === game.id}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a lesson..." />
                            </SelectTrigger>
                            {openSelectForGameId === game.id && (
                              <SelectContent>
                                <SelectItem value="none">No lesson assigned</SelectItem>
                                {lessons.map((lesson) => (
                                  <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                    {getLanguageFlag(lesson.course_language)} {lesson.title} ({lesson.course_title})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            )}
                          </Select>
                          {assigningLesson === game.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                          )}
                        </div>
                        {game.lesson_title && (
                          <p className="text-xs text-gray-600 mt-1">
                            Currently assigned to: <strong>{game.lesson_title}</strong>
                            {game.course_title && ` (${game.course_title})`}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Embedded Game */}
                    {isExpanded && (
                      <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
                        {game.game_type === 'wordwall' && game.embed_html ? (
                          <div 
                            className="w-full"
                            dangerouslySetInnerHTML={{ __html: game.embed_html }}
                            style={{ minHeight: `${game.height || 400}px` }}
                          />
                        ) : game.game_type === 'memory' && game.game_config?.memory ? (
                          <MemoryGame config={game.game_config.memory} />
                        ) : game.game_type === 'hangman' && game.game_config?.hangman ? (
                          <HangmanGame config={game.game_config.hangman} />
                        ) : game.game_type === 'flashcards' && game.game_config?.flashcards ? (
                          <FlashcardsGame config={game.game_config.flashcards} />
                        ) : game.game_type === 'word_search' && game.game_config?.wordSearch ? (
                          <WordSearchGame config={game.game_config.wordSearch} />
                        ) : game.game_type === 'word_mixup' && game.game_config?.wordMixup ? (
                          <WordMixupGame config={game.game_config.wordMixup} />
                        ) : game.game_type === 'word_association' && game.game_config?.wordAssociation ? (
                          <WordAssociationGame config={game.game_config.wordAssociation} />
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Game preview not available</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Game Details */}
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Type:</span> {game.game_type}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {game.category}
                        </div>
                        <div>
                          <span className="font-medium">Difficulty:</span> {game.difficulty_level}/5
                        </div>
                        <div>
                          <span className="font-medium">Usage:</span> {game.usage_count} times
                        </div>
                      </div>
                      
                      {/* Lesson Assignment */}
                      <div className="pt-2 border-t">
                        {game.lesson_title ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="h-4 w-4" />
                            <span><strong>Lesson:</strong></span>
                            <Link 
                              href={`/dashboard/content/lessons/${game.lesson_id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {game.lesson_title}
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <BookOpen className="h-4 w-4" />
                            <span><em>No lesson assigned</em></span>
                          </div>
                        )}
                      </div>
                      
                      {game.tags && game.tags.length > 0 && (
                        <div>
                          <span className="font-medium">Tags:</span> 
                          <div className="flex flex-wrap gap-1 mt-1">
                            {game.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Added: {new Date(game.created_at).toLocaleDateString()}</span>
                        {game.is_featured && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {games.length === 0 ? 'No games added yet' : 'No games match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {games.length === 0 
                ? canCreateEdit ? 'Add your first Wordwall game using the form above.' : 'No games are available yet.'
                : 'Try adjusting your search or category filters.'}
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setLessonFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Game Modal */}
      <CreateGameModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGameCreated={async () => {
          // Reload from API to ensure we have joined fields like lesson_title
          await loadGamesFromDatabase();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
} 