'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { logVocabularyActivity } from '@/lib/activity-logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  Volume2,
  BookOpen,
  Calendar,
  Globe,
  Star,
  MessageSquare,
  Image as ImageIcon,
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
  course_level?: string;
}

export default function VocabularyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vocabularyId = params.id as string;
  
  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (vocabularyId) {
      fetchVocabulary();
    }
  }, [vocabularyId]);

  const fetchVocabulary = async () => {
    try {
      const response = await fetch(`/api/vocabulary/${vocabularyId}`);
      if (response.ok) {
        const wordData = await response.json();
        setWord(wordData);
        
        // Log that user studied vocabulary
        logVocabularyActivity('STUDY_VOCABULARY');
      } else {
        console.error('Failed to fetch vocabulary');
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vocabulary word? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/vocabulary/${vocabularyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/dashboard/content/vocabulary');
      } else {
        console.error('Failed to delete vocabulary');
        alert('Failed to delete vocabulary word. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      alert('Failed to delete vocabulary word. Please try again.');
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
    if (word.word_french) languages.push({ code: 'fr', flag: '🇫🇷', word: word.word_french, name: 'French' });
    if (word.word_german) languages.push({ code: 'de', flag: '🇩🇪', word: word.word_german, name: 'German' });
    if (word.word_spanish) languages.push({ code: 'es', flag: '🇪🇸', word: word.word_spanish, name: 'Spanish' });
    languages.push({ code: 'en', flag: '🇬🇧', word: word.word_english, name: 'English' });
    return languages;
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

  if (!word) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vocabulary not found</h2>
          <p className="text-gray-600 mb-4">The vocabulary word you're looking for doesn't exist.</p>
          <Link href="/dashboard/content/vocabulary">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vocabulary
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
        <Link href="/dashboard/content/vocabulary">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{word.word_english}</h1>
          {word.phonetic && (
            <p className="text-gray-500 font-mono">/{word.phonetic}/</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/content/vocabulary/${word.id}/edit`}>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Translations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAvailableLanguages(word).map((lang, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium text-gray-700">{lang.name}</span>
                    </div>
                    <p className="text-xl font-semibold">{lang.word}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Context and Cultural Information */}
          {(word.context_sentence || word.cultural_note) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Context & Culture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {word.context_sentence && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Example Sentence:</h4>
                    <p className="text-gray-900 italic bg-gray-50 p-3 rounded-lg">
                      "{word.context_sentence}"
                    </p>
                  </div>
                )}
                
                {word.cultural_note && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Cultural Note:</h4>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      {word.cultural_note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Media */}
          {(word.audio_file || word.image_file) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {word.audio_file && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Pronunciation
                    </h4>
                    <audio controls className="w-full">
                      <source src={word.audio_file} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                
                {word.image_file && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Image</h4>
                    <img 
                      src={word.image_file} 
                      alt={word.word_english}
                      className="max-w-full h-auto rounded-lg border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Word Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Type:</span>
                {word.word_type ? (
                  <Badge variant="outline" className="text-xs">
                    {getTypeIcon(word.word_type)} {word.word_type}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Difficulty:</span>
                <Badge className={getDifficultyColor(word.difficulty_level)}>
                  Level {word.difficulty_level} {getDifficultyStars(word.difficulty_level)}
                </Badge>
              </div>

              {word.pronunciation && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Pronunciation:</span>
                  <span className="text-sm text-gray-900">{word.pronunciation}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Added {new Date(word.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Lesson Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lesson Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {word.lesson_title ? (
                <div className="space-y-2">
                  <div>
                    <Link 
                      href={`/dashboard/content/lessons/${word.lesson_id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {word.lesson_title}
                    </Link>
                  </div>
                  {word.course_language && (
                    <div className="text-sm text-gray-600">
                      {getLanguageFlag(word.course_language)} {word.course_title}
                    </div>
                  )}
                  {word.course_level && (
                    <div className="text-xs text-gray-500">
                      Level: {word.course_level}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Not assigned to any lesson</p>
                  <Link href={`/dashboard/content/vocabulary/${word.id}/edit`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Assign to Lesson
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}