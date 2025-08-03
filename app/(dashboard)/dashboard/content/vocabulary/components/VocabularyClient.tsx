'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Languages, 
  Plus, 
  Search, 
  Volume2, 
  BookOpen, 
  GraduationCap,
  Filter,
  Globe,
  Star,
  Clock,
  MessageSquare,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { AudioPlayer } from '@/components/ui/audio-player';

interface VocabularyWord {
  id: number;
  word_french?: string;
  word_german?: string;
  word_spanish?: string;
  word_english: string;
  pronunciation?: string;
  phonetic?: string;
  audio_file?: string;
  image_file?: string;
  context_sentence?: string;
  cultural_note?: string;
  difficulty_level: number;
  word_type?: string;
  lesson_id?: number;
  topic_id?: number;
  created_at: string;
  lesson_title?: string;
  course_title?: string;
  course_language?: string;
}

interface VocabularyClientProps {
  userRole: string;
}

export function VocabularyClient({ userRole }: VocabularyClientProps) {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');

  // Check if user can create/edit vocabulary
  const canCreateEdit = userRole === 'super_admin' || userRole === 'content_creator';

  useEffect(() => {
    fetchVocabulary();
  }, []);

  useEffect(() => {
    filterVocabulary();
  }, [vocabulary, searchTerm, languageFilter, typeFilter, difficultyFilter, lessonFilter]);

  const fetchVocabulary = async () => {
    try {
      const response = await fetch('/api/vocabulary');
      if (response.ok) {
        const data = await response.json();
        setVocabulary(data);
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVocabulary = () => {
    let filtered = vocabulary;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word_english?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.word_french?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.word_german?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.word_spanish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.context_sentence?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(word => word.course_language === languageFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(word => word.word_type === typeFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      const level = parseInt(difficultyFilter);
      filtered = filtered.filter(word => word.difficulty_level === level);
    }

    // Lesson filter
    if (lessonFilter !== 'all') {
      if (lessonFilter === 'assigned') {
        filtered = filtered.filter(word => word.lesson_id);
      } else if (lessonFilter === 'unassigned') {
        filtered = filtered.filter(word => !word.lesson_id);
      }
    }

    setFilteredVocabulary(filtered);
  };

  const getLanguageFlag = (language: string) => {
    const flags = {
      french: '🇫🇷',
      german: '🇩🇪',
      spanish: '🇪🇸'
    };
    return flags[language as keyof typeof flags] || '🌐';
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

  const getTypeIcon = (type: string) => {
    const icons = {
      noun: '📦',
      verb: '🏃',
      adjective: '🎨',
      adverb: '⚡',
      pronoun: '👤',
      preposition: '🔗',
      conjunction: '🔗',
      interjection: '💬'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getAvailableLanguages = (word: VocabularyWord) => {
    const languages = [];
    if (word.word_french) languages.push('🇫🇷');
    if (word.word_german) languages.push('🇩🇪');
    if (word.word_spanish) languages.push('🇪🇸');
    if (word.word_english) languages.push('🇬🇧');
    return languages.join(' ');
  };

  const uniqueLanguages = [...new Set(vocabulary.map(word => word.course_language).filter(Boolean))];
  const uniqueTypes = [...new Set(vocabulary.map(word => word.word_type).filter(Boolean))];
  const assignedWords = vocabulary.filter(word => word.lesson_id).length;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="h-8 w-8 text-purple-600" />
            {canCreateEdit ? 'Vocabulary Management' : 'Vocabulary Overview'}
          </h1>
          <p className="text-gray-600 mt-1">
            {canCreateEdit 
              ? 'Manage vocabulary words, translations, and pronunciations'
              : 'Browse and view vocabulary words, translations, and pronunciations'
            }
          </p>
        </div>
        {canCreateEdit && (
          <Link href="/dashboard/content/vocabulary/create">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Vocabulary
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Words</p>
                <p className="text-2xl font-bold text-purple-600">{vocabulary.length}</p>
              </div>
              <Languages className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Languages</p>
                <p className="text-2xl font-bold text-blue-600">{uniqueLanguages.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Word Types</p>
                <p className="text-2xl font-bold text-green-600">{uniqueTypes.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned to Lessons</p>
                <p className="text-2xl font-bold text-orange-600">{assignedWords}</p>
                <p className="text-xs text-gray-500">{vocabulary.length - assignedWords} unassigned</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vocabulary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Language</label>
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
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Word Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="noun">📦 Noun</SelectItem>
                  <SelectItem value="verb">🏃 Verb</SelectItem>
                  <SelectItem value="adjective">🎨 Adjective</SelectItem>
                  <SelectItem value="adverb">⚡ Adverb</SelectItem>
                  <SelectItem value="pronoun">👤 Pronoun</SelectItem>
                  <SelectItem value="preposition">🔗 Preposition</SelectItem>
                  <SelectItem value="conjunction">🔗 Conjunction</SelectItem>
                  <SelectItem value="interjection">💬 Interjection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1">⭐ Beginner</SelectItem>
                  <SelectItem value="2">⭐⭐ Elementary</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Intermediate</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ Advanced</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Lesson Assignment</label>
              <Select value={lessonFilter} onValueChange={setLessonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Lessons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Words</SelectItem>
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
                  setLanguageFilter('all');
                  setTypeFilter('all');
                  setDifficultyFilter('all');
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

      {/* Vocabulary Grid */}
      {filteredVocabulary.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVocabulary.map((word) => (
            <Card key={word.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg line-clamp-2">{word.word_english}</CardTitle>
                      <AudioPlayer 
                        text={word.word_english} 
                        language="english" 
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getDifficultyColor(word.difficulty_level)}>
                        {getDifficultyStars(word.difficulty_level)}
                      </Badge>
                      {word.word_type && (
                        <Badge variant="outline" className="text-xs">
                          {getTypeIcon(word.word_type)} {word.word_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg mb-1">{getAvailableLanguages(word)}</div>
                    {word.course_language && (
                      <span className="text-sm text-gray-500">{getLanguageFlag(word.course_language)}</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Translations */}
                <div className="space-y-1">
                  {word.word_french && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">🇫🇷</span>
                      <span className="font-medium">{word.word_french}</span>
                      <AudioPlayer 
                        text={word.word_french} 
                        language="french" 
                        size="sm"
                      />
                    </div>
                  )}
                  {word.word_german && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">🇩🇪</span>
                      <span className="font-medium">{word.word_german}</span>
                      <AudioPlayer 
                        text={word.word_german} 
                        language="german" 
                        size="sm"
                      />
                    </div>
                  )}
                  {word.word_spanish && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">🇪🇸</span>
                      <span className="font-medium">{word.word_spanish}</span>
                      <AudioPlayer 
                        text={word.word_spanish} 
                        language="spanish" 
                        size="sm"
                      />
                    </div>
                  )}
                </div>

                {/* Pronunciation */}
                {word.pronunciation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Volume2 className="h-4 w-4" />
                    <span>{word.pronunciation}</span>
                  </div>
                )}

                {/* Context Sentence */}
                {word.context_sentence && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Context:</span> 
                      <span className="flex-1">{word.context_sentence}</span>
                      <AudioPlayer 
                        text={word.context_sentence} 
                        language={word.course_language || 'english'} 
                        size="sm"
                      />
                    </div>
                  </div>
                )}

                {/* Lesson Assignment */}
                {word.lesson_title ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <div>
                      <span className="font-medium">Lesson:</span>{' '}
                      <Link 
                        href={`/dashboard/content/lessons/${word.lesson_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {word.lesson_title}
                      </Link>
                    </div>
                    {word.course_language && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {getLanguageFlag(word.course_language)} {word.course_title}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <BookOpen className="h-4 w-4" />
                    <span><em>No lesson assigned</em></span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/content/vocabulary/${word.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {canCreateEdit && (
                    <>
                      <Link href={`/dashboard/content/vocabulary/${word.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete the word "${word.word_english}"?`)) {
                            try {
                              const response = await fetch(`/api/vocabulary/${word.id}`, {
                                method: 'DELETE'
                              });
                              if (response.ok) {
                                fetchVocabulary(); // Reload the vocabulary list
                              } else {
                                alert('Failed to delete vocabulary word');
                              }
                            } catch (error) {
                              console.error('Error deleting vocabulary:', error);
                              alert('Failed to delete vocabulary word');
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Languages className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vocabulary found</h3>
            <p className="text-gray-600 mb-6">
              {vocabulary.length === 0 
                ? "No vocabulary words have been added yet." 
                : "No vocabulary words match your current filters."}
            </p>
            {vocabulary.length === 0 && canCreateEdit ? (
              <Link href="/dashboard/content/vocabulary/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Vocabulary Word
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setLanguageFilter('all');
                  setTypeFilter('all');
                  setDifficultyFilter('all');
                  setLessonFilter('all');
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