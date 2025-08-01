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

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [lessonFilter, setLessonFilter] = useState('all');

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
      filtered = filtered.filter(word => word.difficulty_level === parseInt(difficultyFilter));
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
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyStars = (level: number) => {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'noun': '📦',
      'verb': '⚡',
      'adjective': '🎨',
      'adverb': '⚡',
      'preposition': '🔗',
      'conjunction': '🔗',
      'interjection': '❗'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getAvailableLanguages = (word: VocabularyWord) => {
    const languages = [];
    if (word.word_french) languages.push({ code: 'fr', flag: '🇫🇷', word: word.word_french });
    if (word.word_german) languages.push({ code: 'de', flag: '🇩🇪', word: word.word_german });
    if (word.word_spanish) languages.push({ code: 'es', flag: '🇪🇸', word: word.word_spanish });
    languages.push({ code: 'en', flag: '🇬🇧', word: word.word_english });
    return languages;
  };

  // Get unique values for filters
  const uniqueLanguages = [...new Set(vocabulary.map(word => word.course_language).filter((lang): lang is string => Boolean(lang)))];
  const uniqueTypes = [...new Set(vocabulary.map(word => word.word_type).filter((type): type is string => Boolean(type)))];
  const uniqueDifficulties = [...new Set(vocabulary.map(word => word.difficulty_level))].sort();
  const assignedWords = vocabulary.filter(word => word.lesson_id).length;

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
            <Languages className="h-8 w-8 text-purple-600" />
            Vocabulary Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage vocabulary words, translations, and pronunciations
          </p>
        </div>
        <Link href="/dashboard/content/vocabulary/create">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Vocabulary
          </Button>
        </Link>
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
                  <SelectValue placeholder="All languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {uniqueLanguages.map(language => (
                    <SelectItem key={language} value={language}>
                      {getLanguageFlag(language)} {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Word Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getTypeIcon(type)} {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueDifficulties.map(level => (
                    <SelectItem key={level} value={level.toString()}>
                      Level {level} {getDifficultyStars(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Lesson Assignment</label>
              <Select value={lessonFilter} onValueChange={setLessonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All words" />
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

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredVocabulary.length} of {vocabulary.length} vocabulary words
        </p>
      </div>

      {/* Vocabulary Cards */}
      {filteredVocabulary.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVocabulary.map((word) => (
            <Card key={word.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {word.word_english}
                    </CardTitle>
                    {word.phonetic && (
                      <p className="text-sm text-gray-500 font-mono">/{word.phonetic}/</p>
                    )}
                  </div>
                  {word.audio_file && (
                    <Button variant="outline" size="sm">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {word.word_type && (
                    <Badge variant="outline" className="text-xs">
                      {getTypeIcon(word.word_type)} {word.word_type}
                    </Badge>
                  )}
                  <Badge className={getDifficultyColor(word.difficulty_level)}>
                    Level {word.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Translations */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Translations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableLanguages(word).map((lang, index) => (
                      <div key={index} className="bg-gray-50 px-2 py-1 rounded text-sm">
                        <span className="mr-1">{lang.flag}</span>
                        {lang.word}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Context Sentence */}
                {word.context_sentence && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Context:</h4>
                    <p className="text-sm text-gray-700 italic">"{word.context_sentence}"</p>
                  </div>
                )}

                {/* Cultural Note */}
                {word.cultural_note && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Cultural Note:</h4>
                    <p className="text-sm text-gray-700">{word.cultural_note}</p>
                  </div>
                )}

                {/* Lesson Assignment */}
                <div className="pt-2 border-t">
                  {word.lesson_title ? (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span><strong>Lesson:</strong></span>
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
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/content/vocabulary/${word.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
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
            {vocabulary.length === 0 ? (
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