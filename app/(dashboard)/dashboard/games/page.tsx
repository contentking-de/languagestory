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
  Target,
  Calendar,
  Eye,
  Trash2
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
  tags: string[] | null;
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

export default function GamesPage() {
  const [games, setGames] = useState<DatabaseGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newGameUrl, setNewGameUrl] = useState('');
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Sample Wordwall game URLs for different subjects and languages (verified working URLs)
  const sampleGames = [
    'https://wordwall.net/resource/3373786/animals-esl-kids', // Animals ESL Game - Quiz format
    'https://wordwall.net/resource/11547408/reading/compound-words', // Compound Words - Spin the wheel
    'https://wordwall.net/resource/10113660/byzantine-empire', // Byzantine Empire Quiz - Maze chase
    'https://wordwall.net/resource/16556880/science/name-that-thing', // Name That Thing - Gameshow quiz
  ];

  // Load games from database on component mount
  useEffect(() => {
    loadGamesFromDatabase();
  }, []);

  const loadGamesFromDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/games/wordwall');
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      } else {
        console.error('Failed to load games from database');
        alert('❌ Failed to load games from database');
      }
    } catch (error) {
      console.error('Error loading games:', error);
      alert('❌ Error loading games. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleGames = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/games/wordwall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: sampleGames }),
      });

      if (response.ok) {
        const data = await response.json();
        const successfulGames = data.games.filter((result: any) => result.success);
        const failedGames = data.games.filter((result: any) => !result.success);
        
        if (successfulGames.length > 0) {
          // Reload games from database to get the latest data
          await loadGamesFromDatabase();
          
          const successDiv = document.createElement('div');
          successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
          successDiv.textContent = `✅ Loaded ${successfulGames.length} sample games!`;
          document.body.appendChild(successDiv);
          setTimeout(() => successDiv.remove(), 3000);
        }
        if (failedGames.length > 0) {
          console.warn(`Failed to load ${failedGames.length} sample games:`, failedGames);
          alert(`⚠️ ${failedGames.length} sample games failed to load. Successfully loaded ${successfulGames.length} games.`);
        }
      } else {
        throw new Error('Failed to load sample games');
      }
    } catch (error) {
      console.error('Error loading sample games:', error);
      alert('❌ Failed to load sample games. You can still add games manually using Wordwall URLs.');
    } finally {
      setLoading(false);
    }
  };

  const addGame = async () => {
    if (!newGameUrl.trim()) return;

    // Enhanced URL validation
    const url = newGameUrl.trim();
    if (!url.includes('wordwall.net') || !url.startsWith('http')) {
      alert('Please enter a valid Wordwall URL starting with "http" and containing "wordwall.net"');
      return;
    }

    // Additional safety check
    if (url.includes('Error') || url.includes('error')) {
      alert('Invalid URL format. Please enter a clean Wordwall game URL.');
      return;
    }

    setIsAddingGame(true);
    try {
      console.log('Adding game with URL:', url);
      const response = await fetch(`/api/games/wordwall?url=${encodeURIComponent(url)}`, {
        method: 'POST'
      });

      if (response.ok) {
        const savedGame = await response.json();
        // Add the new game to the current list
        setGames(prev => [savedGame, ...prev]);
        setNewGameUrl('');
        
        // Success feedback
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successDiv.textContent = '✅ Game added successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        
        if (response.status === 409) {
          alert(`❌ Game already exists in database!\n\nTitle: ${error.existingGame.title}`);
        } else {
          alert(`❌ ${error.error || 'Failed to add game'}`);
        }
      }
    } catch (error) {
      console.error('Error adding game:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsAddingGame(false);
    }
  };

  const testUrl = async () => {
    if (!newGameUrl.trim()) return;

    // Enhanced URL validation
    const url = newGameUrl.trim();
    if (!url.includes('wordwall.net') || !url.startsWith('http')) {
      alert('Please enter a valid Wordwall URL starting with "http" and containing "wordwall.net"');
      return;
    }

    // Additional safety check
    if (url.includes('Error') || url.includes('error')) {
      alert('Invalid URL format. Please enter a clean Wordwall game URL.');
      return;
    }

    setIsTestingUrl(true);
    try {
      console.log('Testing URL:', url);
      
      // Normalize long URLs automatically (Wordwall API requirement)
      const resourceMatch = url.match(/https:\/\/wordwall\.net\/(resource|play)\/(\d+)/);
      if (resourceMatch && url !== `https://wordwall.net/${resourceMatch[1]}/${resourceMatch[2]}`) {
        const normalizedUrl = `https://wordwall.net/${resourceMatch[1]}/${resourceMatch[2]}`;
        console.log('URL normalized:', normalizedUrl);
      }
      
      // Check if game already exists by making a quick API call
      const response = await fetch(`/api/games/wordwall?url=${encodeURIComponent(url)}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const gameData = await response.json();
        alert(`✅ URL is valid!\n\nGame: ${gameData.title}\nAuthor: ${gameData.author_name || 'N/A'}\nCategory: ${gameData.category}\n\nNote: Test successful, but game was not saved.`);
        
        // Remove the game since this was just a test
        await fetch(`/api/games/wordwall/${gameData.id}`, { method: 'DELETE' });
      } else if (response.status === 409) {
        const error = await response.json();
        alert(`✅ URL is valid but game already exists!\n\nGame: ${error.existingGame.title}\nAuthor: ${error.existingGame.author_name || 'N/A'}\nAdded: ${new Date(error.existingGame.created_at).toLocaleDateString()}`);
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        alert(`❌ ${error.error || 'Failed to validate URL'}`);
      }
    } catch (error) {
      console.error('Error testing URL:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsTestingUrl(false);
    }
  };

  const incrementGameUsage = async (gameId: number) => {
    try {
      await fetch(`/api/games/wordwall/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ increment_usage: true }),
      });
      
      // Update local state to reflect the change
      setGames(prev => prev.map(game => 
        game.id === gameId 
          ? { ...game, usage_count: game.usage_count + 1 }
          : game
      ));
    } catch (error) {
      console.error('Error incrementing game usage:', error);
    }
  };

  const toggleGameExpanded = (index: number) => {
    setExpandedGame(expandedGame === index ? null : index);
    
    // Increment usage count when a game is expanded (played)
    if (expandedGame !== index) {
      const game = filteredGames[index];
      if (game) {
        incrementGameUsage(game.id);
      }
    }
  };

  const getGameCategory = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('french') || titleLower.includes('français')) return 'french';
    if (titleLower.includes('german') || titleLower.includes('deutsch')) return 'german';
    if (titleLower.includes('spanish') || titleLower.includes('español')) return 'spanish';
    if (titleLower.includes('math') || titleLower.includes('number')) return 'math';
    if (titleLower.includes('science') || titleLower.includes('chemistry')) return 'science';
    return 'general';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      french: '🇫🇷',
      german: '🇩🇪', 
      spanish: '🇪🇸',
      math: '📊',
      science: '🔬',
      general: '🎯'
    };
    return icons[category as keyof typeof icons] || '🎮';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      french: 'bg-blue-100 text-blue-800',
      german: 'bg-red-100 text-red-800',
      spanish: 'bg-yellow-100 text-yellow-800',
      math: 'bg-green-100 text-green-800',
      science: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        game.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(games.map(game => game.category))];
  const uniqueAuthors = [...new Set(games.map(game => game.author_name).filter(Boolean))];
  const totalUsage = games.reduce((sum, game) => sum + game.usage_count, 0);
  const featuredGames = games.filter(game => game.is_featured);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-indigo-600" />
            Educational Games Library
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and organize interactive games from Wordwall
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => loadGamesFromDatabase()}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            onClick={loadSampleGames}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Load Sample Games
          </Button>
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
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">{featuredGames.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
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

      {/* Add New Game */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Wordwall Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="game-url" className="text-sm font-medium text-gray-700 mb-1 block">
                Wordwall Game URL
              </label>
              <Input
                id="game-url"
                placeholder="e.g., https://wordwall.net/resource/12345"
                value={newGameUrl}
                onChange={(e) => setNewGameUrl(e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1 space-y-2">
                <p><strong>Step-by-step:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Visit <a href="https://wordwall.net" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">wordwall.net</a></li>
                  <li>Search for educational games (try "French vocabulary" or "math quiz")</li>
                  <li>Click on any game you like</li>
                  <li>Copy the URL from your browser's address bar</li>
                  <li>Paste it above and click "Test URL" first</li>
                </ol>
                <div className="mt-2">
                  <p className="text-xs"><strong>Supported formats:</strong></p>
                  <ul className="text-xs text-gray-400 mt-1">
                    <li>• https://wordwall.net/resource/[number]</li>
                    <li>• https://wordwall.net/resource/[number]/[game-name] <span className="text-indigo-600">(auto-normalized)</span></li>
                    <li>• https://wordwall.net/play/[number]</li>
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => setNewGameUrl('https://wordwall.net/resource/3373786/animals-esl-kids')}
                      className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 rounded text-xs text-indigo-700"
                    >
                      Try: Animals ESL
                    </button>
                    <button
                      onClick={() => setNewGameUrl('https://wordwall.net/resource/11547408/reading/compound-words')}
                      className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-xs text-green-700"
                    >
                      Try: Compound Words
                    </button>
                    <button
                      onClick={() => setNewGameUrl('https://wordwall.net/resource/10113660/byzantine-empire')}
                      className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs text-blue-700"
                    >
                      Try: History Quiz
                    </button>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    <p><strong>💡 Tips:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Only public Wordwall games can be embedded</li>
                      <li>Try different game URLs from <a href="https://wordwall.net" target="_blank" rel="noopener noreferrer" className="underline">wordwall.net</a></li>
                      <li>Use "Test URL" before adding to verify the game exists</li>
                      <li>Look for games with various templates (quiz, wheel, matching, etc.)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={testUrl}
                variant="outline"
                disabled={!newGameUrl.trim() || isTestingUrl || isAddingGame}
              >
                {isTestingUrl ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Test URL
              </Button>
              <Button
                onClick={addGame}
                disabled={!newGameUrl.trim() || isAddingGame || isTestingUrl}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isAddingGame ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Game
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading games from Wordwall...</p>
        </div>
      ) : filteredGames.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredGames.length} of {games.length} games
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGames.map((game, index) => {
              const category = game.category;
              const isExpanded = expandedGame === index;
              
              return (
                <Card key={game.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                            {getCategoryIcon(category)} {category}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {game.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          by <span className="font-medium">{game.author_name || 'N/A'}</span>
                        </p>
                      </div>
                      {game.thumbnail_url && (
                        <img 
                          src={game.thumbnail_url} 
                          alt={game.title}
                          className="w-20 h-16 object-cover rounded border"
                        />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => toggleGameExpanded(index)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isExpanded ? 'Hide Game' : 'Play Game'}
                      </Button>
                      <a 
                        href={game.original_url || game.author_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="flex-1">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Wordwall
                        </Button>
                      </a>
                    </div>

                    {/* Embedded Game */}
                    {isExpanded && (
                      <div className="border rounded-lg overflow-hidden bg-gray-50">
                        <div 
                          className="w-full"
                          dangerouslySetInnerHTML={{ __html: game.embed_html }}
                          style={{ minHeight: `${game.height || 400}px` }}
                        />
                      </div>
                    )}

                    {/* Game Details */}
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Dimensions:</span> {game.width || 'N/A'}x{game.height || 'N/A'}
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
                ? 'Add your first Wordwall game using the form above.'
                : 'Try adjusting your search or category filters.'}
            </p>
            {games.length === 0 ? (
              <Button onClick={loadGamesFromDatabase} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Load Sample Games
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 