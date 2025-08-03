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
  FileQuestion,
  Edit,
  Plus,
  Trophy,
  CheckCircle,
  Play,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Quiz {
  id: number;
  title: string;
  description: string;
  quiz_type: string;
  pass_percentage: number;
  time_limit: number;
  max_attempts: number;
  points_value: number;
  is_published: boolean;
  lesson_id?: number;
  lesson_title?: string;
}

interface Lesson {
  id: number;
  title: string;
  course_title: string;
  course_language: string;
  course_level: string;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  correct_answer: string;
  answer_options: any;
}

export default function QuizEditPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quiz_type: '',
    lesson_id: undefined as number | undefined,
    pass_percentage: 70,
    time_limit: 0,
    max_attempts: 0,
    points_value: 10,
    is_published: false,
    // Gap Fill specific
    gf_original_text: '', // Original complete text (source of truth)
    gf_text_content: '', // Text with gaps (auto-generated, read-only)
    gf_num_gaps: 5,
    gf_word_bank: '',
    gf_correct_order: '',
    gf_difficulty: 'medium',
    gf_allow_hints: true,
  });

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
      fetchQuestions();
      fetchLessons();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);

        // Parse description to extract actual description and configuration
        let actualDescription = '';
        let gapFillConfig = {};
        
        try {
          const parsed = JSON.parse(quizData.description || '{}');
          if (parsed.description !== undefined) {
            actualDescription = parsed.description;
          } else {
            actualDescription = quizData.description || '';
          }
          
          // Extract Gap Fill configuration if it exists
          if (parsed.config && parsed.config.gap_fill) {
            gapFillConfig = parsed.config.gap_fill;
          }
        } catch (error) {
          actualDescription = quizData.description || '';
        }

        setFormData({
          title: quizData.title,
          description: actualDescription,
          quiz_type: quizData.quiz_type,
          lesson_id: quizData.lesson_id,
          pass_percentage: quizData.pass_percentage || 70,
          time_limit: quizData.time_limit || 0,
          max_attempts: quizData.max_attempts || 0,
          points_value: quizData.points_value || 10,
          is_published: quizData.is_published,
          // Gap Fill specific - populate from configuration
          gf_original_text: (gapFillConfig as any)?.original_text || '',
          gf_text_content: (gapFillConfig as any)?.text_content || '',
          gf_num_gaps: (gapFillConfig as any)?.num_gaps || 5,
          gf_word_bank: (gapFillConfig as any)?.word_bank || '',
          gf_correct_order: (gapFillConfig as any)?.correct_order || '',
          gf_difficulty: (gapFillConfig as any)?.difficulty || 'medium',
          gf_allow_hints: (gapFillConfig as any)?.allow_hints ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions`);
      if (response.ok) {
        const questionsData = await response.json();
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
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

  // Helper functions for question display
  const getQuestionTypeIcon = (type: string) => {
    const icons = {
      multiple_choice: FileQuestion,
      true_false: CheckCircle,
      fill_blank: Edit
    };
    return icons[type as keyof typeof icons] || FileQuestion;
  };

  const getQuestionTypeColor = (type: string) => {
    const colors = {
      multiple_choice: 'bg-blue-100 text-blue-800',
      true_false: 'bg-green-100 text-green-800',
      fill_blank: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Auto-replace words in text with [BLANK] when they appear in word bank
  const autoReplaceWithBlanks = (text: string, wordBank: string) => {
    if (!text || !wordBank.trim()) return { updatedText: text, correctOrder: [] };
    
    // Extract words from word bank (comma-separated, trimmed)
    const words = wordBank.split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0)
      .sort((a, b) => b.length - a.length); // Sort by length (longest first) to avoid partial replacements
    
    let updatedText = text;
    const correctOrder: string[] = []; // Track the order of replacements
    
    // Track replaced words to maintain order
    const replacements: { position: number; word: string; originalWord: string }[] = [];
    
    words.forEach(word => {
      if (word.length > 0) {
        // Create a case-insensitive regex that matches whole words only
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        
        // Find all matches and their positions
        let match;
        while ((match = regex.exec(text)) !== null) {
          replacements.push({
            position: match.index,
            word: word,
            originalWord: match[0] // Keep the original case
          });
          // Reset regex to avoid infinite loop
          regex.lastIndex = 0;
          break; // Only replace first occurrence of each word
        }
      }
    });
    
    // Sort replacements by position to maintain order
    replacements.sort((a, b) => a.position - b.position);
    
    // Apply replacements and build correct order
    replacements.forEach(replacement => {
      const wordRegex = new RegExp(`\\b${replacement.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      updatedText = updatedText.replace(wordRegex, '[BLANK]');
      correctOrder.push(replacement.originalWord);
    });
    
    return { updatedText, correctOrder };
  };

  // Handle word bank changes with auto-replacement
  const handleWordBankChange = (newWordBank: string) => {
    setFormData(prev => {
      const { updatedText, correctOrder } = autoReplaceWithBlanks(prev.gf_original_text, newWordBank);
      return {
        ...prev,
        gf_word_bank: newWordBank,
        gf_text_content: updatedText, // Auto-generated from original text
        gf_correct_order: correctOrder.join('|') // Store the correct order for the API
      };
    });
  };

  // Handle original text changes and update gaps
  const handleOriginalTextChange = (newOriginalText: string) => {
    setFormData(prev => {
      const { updatedText, correctOrder } = autoReplaceWithBlanks(newOriginalText, prev.gf_word_bank);
      return {
        ...prev,
        gf_original_text: newOriginalText,
        gf_text_content: updatedText, // Auto-generated from original text
        gf_correct_order: correctOrder.join('|')
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/content/quizzes/${quizId}`);
      } else {
        console.error('Failed to update quiz');
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
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

  if (!quiz) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz not found</h2>
          <p className="text-gray-600 mb-4">The quiz you're trying to edit doesn't exist.</p>
          <Link href="/dashboard/content/quizzes">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
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
        <Link href={`/dashboard/content/quizzes/${quizId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
          <p className="text-gray-600 mt-1">
            {quiz.lesson_title && `Lesson: ${quiz.lesson_title}`}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief description of the quiz..."
                />
              </div>

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
                  Assign this quiz to a specific lesson for better organization
                </p>
              </div>

              {/* Gap Fill Configuration */}
              {formData.quiz_type === 'gap_fill' && (
                <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                  <div>
                    <Label htmlFor="gf_original_text">Original Complete Text</Label>
                    <textarea
                      id="gf_original_text"
                      value={formData.gf_original_text}
                      onChange={(e) => handleOriginalTextChange(e.target.value)}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your complete text here. Example: The cat sat on the mat and meowed loudly."
                    />
                    <p className="text-sm text-gray-600 mt-1">✍️ Enter the complete text exactly as it should read. Gaps will be created automatically based on the Word Bank below.</p>
                  </div>

                  <div>
                    <Label htmlFor="gf_text_content">Preview with Gaps (Auto-Generated)</Label>
                    <textarea
                      id="gf_text_content"
                      value={formData.gf_text_content}
                      readOnly
                      rows={4}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-700"
                      placeholder="Gaps will appear here automatically when you add words to the Word Bank..."
                    />
                    <p className="text-sm text-gray-500 mt-1">🔍 This preview shows how the text will look with gaps. It updates automatically when you change the Word Bank.</p>
                    
                    {/* Enhanced Preview */}
                    {formData.gf_text_content && (
                      <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-medium text-blue-700 mb-2">Student Preview:</p>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {formData.gf_text_content.split('[BLANK]').map((part, index, array) => (
                            <span key={index}>
                              {part}
                              {index < array.length - 1 && <span className="inline-block min-w-[80px] px-2 py-1 mx-1 bg-yellow-200 border-b-2 border-yellow-400 text-center rounded">_____</span>}
                            </span>
                          ))}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gf_num_gaps">Number of Gaps</Label>
                      <Input
                        id="gf_num_gaps"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.gf_num_gaps}
                        onChange={(e) => setFormData(prev => ({ ...prev, gf_num_gaps: parseInt(e.target.value) || 1 }))}
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-600 mt-1">How many [BLANK] spaces to create</p>
                    </div>

                    <div>
                      <Label htmlFor="gf_difficulty">Difficulty Level</Label>
                      <Select
                        value={formData.gf_difficulty}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gf_difficulty: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy - Clear context clues</SelectItem>
                          <SelectItem value="medium">Medium - Some context clues</SelectItem>
                          <SelectItem value="hard">Hard - Minimal context clues</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gf_word_bank">Word Bank (comma-separated)</Label>
                    <textarea
                      id="gf_word_bank"
                      value={formData.gf_word_bank}
                      onChange={(e) => handleWordBankChange(e.target.value)}
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="sat, meowed, quickly, beautiful, house"
                    />
                    <p className="text-sm text-gray-600 mt-1">⚡ Words will automatically be replaced with [BLANK] in the text above. Include extra words for challenge!</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="gf_allow_hints"
                      checked={formData.gf_allow_hints}
                      onChange={(e) => setFormData(prev => ({ ...prev, gf_allow_hints: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="gf_allow_hints">Allow hints for difficult gaps</Label>
                  </div>

                  <div className="bg-green-100 p-3 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>✨ Automated Gap Fill Setup:</strong> 
                      <br />1. Enter your complete text in the field above
                      <br />2. Add the words you want to be gaps in the Word Bank (they'll automatically be replaced with [BLANK])
                      <br />3. Include extra words in the Word Bank to make it more challenging!
                      <br />Students will drag words from the bank to fill the gaps.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quiz_type">Quiz Type</Label>
                  <Select 
                    value={formData.quiz_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, quiz_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehension">Comprehension</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="listening">Listening</SelectItem>
                      <SelectItem value="speaking">Speaking</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pass_percentage">Passing Percentage</Label>
                  <Input
                    id="pass_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pass_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, pass_percentage: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum percentage needed to pass (0-100%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="0"
                    value={formData.time_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set to 0 for no time limit
                  </p>
                </div>

                <div>
                  <Label htmlFor="max_attempts">Max Attempts</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    min="0"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set to 0 for unlimited attempts
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="points_value">Points Value</Label>
                <Input
                  id="points_value"
                  type="number"
                  min="0"
                  value={formData.points_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, points_value: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Points students will earn for completing this quiz
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
                <Label htmlFor="published">Publish this quiz</Label>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Quiz Settings Guide</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Passing Percentage:</strong> Students must score this percentage to pass</li>
                  <li>• <strong>Time Limit:</strong> Maximum time allowed to complete the quiz</li>
                  <li>• <strong>Max Attempts:</strong> How many times students can retake the quiz</li>
                  <li>• <strong>Points Value:</strong> Total points awarded for completing the quiz</li>
                </ul>
              </div>

              {/* Questions Section for Multiple Choice and True/False Quizzes */}
              {formData.quiz_type && formData.quiz_type !== 'gap_fill' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
                    <Link href={`/dashboard/content/quizzes/${quizId}/questions/create`}>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </Link>
                  </div>

                  {questions.length > 0 ? (
                    <div className="space-y-3">
                      {questions.map((question, index) => {
                        const TypeIcon = getQuestionTypeIcon(question.question_type);
                        return (
                          <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                                </div>
                                <div>
                                  <Badge className={getQuestionTypeColor(question.question_type)} variant="outline">
                                    <TypeIcon className="h-3 w-3 mr-1" />
                                    {question.question_type.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Trophy className="h-4 w-4" />
                                <span>{question.points} pts</span>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-gray-900 font-medium">{question.question_text}</p>
                            </div>

                            {question.answer_options && question.question_type === 'multiple_choice' && (
                              <div className="space-y-2 mb-3">
                                {question.answer_options.map((option: string, optionIndex: number) => (
                                  <div key={optionIndex} className="flex items-center gap-2 text-sm">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                      option === question.correct_answer 
                                        ? 'border-green-500 bg-green-100' 
                                        : 'border-gray-300'
                                    }`}>
                                      {option === question.correct_answer && (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      )}
                                    </div>
                                    <span className={option === question.correct_answer ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                      {option}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.question_type === 'true_false' && (
                              <div className="text-sm text-gray-600 mb-3">
                                Correct answer: <span className="font-medium text-green-700">{question.correct_answer}</span>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Link href={`/dashboard/content/quizzes/${quizId}/questions/${question.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                      <p className="text-gray-600 mb-4">
                        Add questions to make this quiz interactive.
                      </p>
                      <Link href={`/dashboard/content/quizzes/${quizId}/questions/create`}>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Question
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

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
                <Link href={`/dashboard/content/quizzes/${quizId}`}>
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