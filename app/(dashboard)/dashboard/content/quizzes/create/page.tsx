'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Loader2,
  FileQuestion,
  Info
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
  lesson_type: string;
  course_id: number;
  course_title: string;
  course_language: string;
  course_level: string;
}

function CreateQuizForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLessonId = searchParams.get('lessonId');
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quiz_type: '',
    pass_percentage: 70,
    time_limit: 0,
    max_attempts: 0,
    points_value: 10,
    is_published: false,
    lesson_id: preselectedLessonId ? parseInt(preselectedLessonId) : 0,
    // Multiple Choice specific
    mc_num_questions: 5,
    mc_num_options: 4,
    mc_randomize_options: true,
    mc_multiple_correct: false,
    // Gap Fill specific
    gf_text_content: '',
    gf_num_gaps: 5,
    gf_word_bank: '',
    gf_difficulty: 'medium',
    gf_allow_hints: true,
    // True/False specific
    tf_num_questions: 10,
    tf_show_explanations: true,
    tf_randomize_order: true,
    tf_immediate_feedback: false,
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
    setCreating(true);

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newQuiz = await response.json();
        router.push(`/dashboard/content/quizzes/${newQuiz.id}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create quiz:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setCreating(false);
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

  const selectedLesson = lessons.find(l => l.id === formData.lesson_id);
  const isFormValid = formData.title && formData.quiz_type && formData.lesson_id > 0;

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
        <Link href="/dashboard/content/quizzes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600 mt-1">
            Add a new quiz to assess student learning
          </p>
        </div>
      </div>

      {/* Creation Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Quiz Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lesson Selection */}
              <div>
                <Label htmlFor="lesson">Lesson *</Label>
                <Select 
                  value={formData.lesson_id.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, lesson_id: parseInt(value) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{getLanguageFlag(lesson.course_language)}</span>
                          <span>{lesson.title}</span>
                          <span className="text-xs text-gray-500">
                            ({lesson.course_title} - {lesson.lesson_type})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLesson && (
                  <p className="text-sm text-gray-600 mt-1">
                    Adding quiz to: {getLanguageFlag(selectedLesson.course_language)} {selectedLesson.title} 
                    <span className="text-gray-500"> in {selectedLesson.course_title}</span>
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1"
                  placeholder="e.g., French Vocabulary Test Chapter 1"
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
                  placeholder="Brief description of what this quiz tests..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quiz_type">Quiz Type *</Label>
                  <Select 
                    value={formData.quiz_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, quiz_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select quiz type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">
                        <div className="flex items-center gap-2">
                          <span>🔘</span>
                          <span>Multiple Choice</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gap_fill">
                        <div className="flex items-center gap-2">
                          <span>📝</span>
                          <span>Gap Fill (Drag & Drop)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="true_false">
                        <div className="flex items-center gap-2">
                          <span>✅</span>
                          <span>True or False</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose the main interaction type for this quiz
                  </p>
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
                    placeholder="70"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum percentage needed to pass (0-100%)
                  </p>
                </div>
              </div>

              {/* Quiz Type Specific Configuration */}
              {formData.quiz_type && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {formData.quiz_type === 'multiple_choice' && '🔘 Multiple Choice Configuration'}
                    {formData.quiz_type === 'gap_fill' && '📝 Gap Fill Configuration'}
                    {formData.quiz_type === 'true_false' && '✅ True or False Configuration'}
                  </h3>

                  {/* Multiple Choice Configuration */}
                  {formData.quiz_type === 'multiple_choice' && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="mc_num_questions">Number of Questions</Label>
                          <Input
                            id="mc_num_questions"
                            type="number"
                            min="1"
                            max="50"
                            value={formData.mc_num_questions}
                            onChange={(e) => setFormData(prev => ({ ...prev, mc_num_questions: parseInt(e.target.value) || 1 }))}
                            className="mt-1"
                          />
                          <p className="text-sm text-gray-600 mt-1">How many multiple choice questions</p>
                        </div>

                        <div>
                          <Label htmlFor="mc_num_options">Answer Options per Question</Label>
                          <Select
                            value={formData.mc_num_options.toString()}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, mc_num_options: parseInt(value) }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 options (A/B)</SelectItem>
                              <SelectItem value="3">3 options (A/B/C)</SelectItem>
                              <SelectItem value="4">4 options (A/B/C/D)</SelectItem>
                              <SelectItem value="5">5 options (A/B/C/D/E)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-gray-600 mt-1">Number of choices per question</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="mc_randomize_options"
                            checked={formData.mc_randomize_options}
                            onChange={(e) => setFormData(prev => ({ ...prev, mc_randomize_options: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor="mc_randomize_options">Randomize answer order</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="mc_multiple_correct"
                            checked={formData.mc_multiple_correct}
                            onChange={(e) => setFormData(prev => ({ ...prev, mc_multiple_correct: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor="mc_multiple_correct">Allow multiple correct answers</Label>
                        </div>
                      </div>

                      <div className="bg-blue-100 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Multiple Choice Setup:</strong> After creating the quiz, you'll be able to add individual questions with their answer options. 
                          Each question will have {formData.mc_num_options} answer choices that students can select from.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gap Fill Configuration */}
                  {formData.quiz_type === 'gap_fill' && (
                    <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                      <div>
                        <Label htmlFor="gf_text_content">Text with Gaps</Label>
                        <textarea
                          id="gf_text_content"
                          value={formData.gf_text_content}
                          onChange={(e) => setFormData(prev => ({ ...prev, gf_text_content: e.target.value }))}
                          rows={4}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter your text here. Use [BLANK] to mark where gaps should be. Example: The cat [BLANK] on the mat and [BLANK] loudly."
                        />
                        <p className="text-sm text-gray-600 mt-1">Use [BLANK] to mark where students should fill in words</p>
                        
                        {/* Preview of gap fill text */}
                        {formData.gf_text_content && (
                          <div className="mt-2 p-2 bg-gray-50 rounded border">
                            <p className="text-xs font-medium text-gray-700 mb-1">Preview:</p>
                            <p className="text-sm text-gray-800">
                              {formData.gf_text_content.split('[BLANK]').map((part, index, array) => (
                                <span key={index}>
                                  {part}
                                  {index < array.length - 1 && (
                                    <span className="inline-block w-16 h-6 bg-green-200 border border-green-300 rounded mx-1 text-xs text-center leading-6">
                                      gap
                                    </span>
                                  )}
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
                          onChange={(e) => setFormData(prev => ({ ...prev, gf_word_bank: e.target.value }))}
                          rows={2}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="sat, meowed, quickly, beautiful, house"
                        />
                        <p className="text-sm text-gray-600 mt-1">Words that students can drag into the gaps (include extra words for challenge)</p>
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
                          <strong>Gap Fill Setup:</strong> Students will see your text with blanks and drag words from the word bank to fill the gaps. 
                          Make sure to include some extra words in the word bank to make it more challenging!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* True/False Configuration */}
                  {formData.quiz_type === 'true_false' && (
                    <div className="space-y-4 bg-yellow-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tf_num_questions">Number of Questions</Label>
                          <Input
                            id="tf_num_questions"
                            type="number"
                            min="1"
                            max="50"
                            value={formData.tf_num_questions}
                            onChange={(e) => setFormData(prev => ({ ...prev, tf_num_questions: parseInt(e.target.value) || 1 }))}
                            className="mt-1"
                          />
                          <p className="text-sm text-gray-600 mt-1">How many true/false questions</p>
                        </div>

                        <div className="flex items-center space-x-2 mt-6">
                          <input
                            type="checkbox"
                            id="tf_show_explanations"
                            checked={formData.tf_show_explanations}
                            onChange={(e) => setFormData(prev => ({ ...prev, tf_show_explanations: e.target.checked }))}
                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <Label htmlFor="tf_show_explanations">Show explanations for answers</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="tf_randomize_order"
                            checked={formData.tf_randomize_order}
                            onChange={(e) => setFormData(prev => ({ ...prev, tf_randomize_order: e.target.checked }))}
                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <Label htmlFor="tf_randomize_order">Randomize question order</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="tf_immediate_feedback"
                            checked={formData.tf_immediate_feedback}
                            onChange={(e) => setFormData(prev => ({ ...prev, tf_immediate_feedback: e.target.checked }))}
                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <Label htmlFor="tf_immediate_feedback">Show feedback immediately</Label>
                        </div>
                      </div>

                      <div className="bg-yellow-100 p-3 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <strong>True/False Setup:</strong> After creating the quiz, you'll add individual statements that students must evaluate as true or false. 
                          You can include explanations to help students understand why each answer is correct.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    placeholder="0"
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
                    placeholder="0"
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
                  placeholder="10"
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
                <Label htmlFor="published">Publish this quiz immediately</Label>
                <p className="text-sm text-gray-500">
                  (You can also publish it later)
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your quiz will be added to the selected lesson</li>
                    {formData.quiz_type === 'multiple_choice' && (
                      <li>• You'll create {formData.mc_num_questions} multiple choice questions with {formData.mc_num_options} options each</li>
                    )}
                    {formData.quiz_type === 'gap_fill' && (
                      <li>• Students will drag words from your word bank to fill {formData.gf_num_gaps} gaps in the text</li>
                    )}
                    {formData.quiz_type === 'true_false' && (
                      <li>• Students will evaluate {formData.tf_num_questions} statements as true or false</li>
                    )}
                    <li>• Students will see it after completing the lesson content</li>
                    <li>• Quiz results will be tracked in student progress</li>
                  </ul>
                </div>
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
                      Create Quiz
                    </>
                  )}
                </Button>
                <Link href="/dashboard/content/quizzes">
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

export default function CreateQuizPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    }>
      <CreateQuizForm />
    </Suspense>
  );
} 