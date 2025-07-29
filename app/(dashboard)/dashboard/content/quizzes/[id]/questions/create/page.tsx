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
  Plus,
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

interface Quiz {
  id: number;
  title: string;
  quiz_type: string;
  lesson_title?: string;
}

export default function CreateQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: '',
    points: 1,
    correct_answer: '',
    answer_options: ['', '', '', ''], // For multiple choice
    explanation: '',
  });

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
        
        // Set default question type based on quiz type
        const defaultQuestionType = getDefaultQuestionType(quizData.quiz_type);
        setFormData(prev => ({ 
          ...prev, 
          question_type: defaultQuestionType,
          answer_options: defaultQuestionType === 'multiple_choice' ? ['', '', '', ''] : ['']
        }));
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultQuestionType = (quizType: string) => {
    switch (quizType) {
      case 'multiple_choice': return 'multiple_choice';
      case 'gap_fill': return 'fill_blank';
      case 'true_false': return 'true_false';
      default: return 'multiple_choice';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quiz_id: parseInt(quizId),
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/content/quizzes/${quizId}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create question:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setCreating(false);
    }
  };

  const addAnswerOption = () => {
    setFormData(prev => ({
      ...prev,
      answer_options: [...prev.answer_options, '']
    }));
  };

  const removeAnswerOption = (index: number) => {
    if (formData.answer_options.length > 2) {
      setFormData(prev => ({
        ...prev,
        answer_options: prev.answer_options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateAnswerOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      answer_options: prev.answer_options.map((option, i) => 
        i === index ? value : option
      )
    }));
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
          <p className="text-gray-600 mb-4">The quiz you're trying to add a question to doesn't exist.</p>
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

  const isFormValid = formData.question_text && formData.question_type && 
    (formData.question_type === 'multiple_choice' 
      ? formData.answer_options.filter(opt => opt.trim()).length >= 2 && formData.correct_answer
      : formData.correct_answer);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/content/quizzes/${quizId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quiz
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Question</h1>
          <p className="text-gray-600 mt-1">
            Quiz: {quiz.title} ({quiz.quiz_type.replace('_', ' ')})
          </p>
        </div>
      </div>

      {/* Creation Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Question Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="question_text">Question Text *</Label>
                <textarea
                  id="question_text"
                  value={formData.question_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                  required
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder={
                    quiz.quiz_type === 'gap_fill' 
                      ? "Enter the text with blanks, e.g., 'The cat ___ on the mat.'"
                      : quiz.quiz_type === 'true_false'
                      ? "Enter a statement that can be evaluated as true or false"
                      : "Enter your question here"
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="question_type">Question Type</Label>
                  <Select 
                    value={formData.question_type} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      question_type: value,
                      answer_options: value === 'multiple_choice' ? ['', '', '', ''] : ['']
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True or False</SelectItem>
                      <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="points">Points Value</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Multiple Choice Options */}
              {formData.question_type === 'multiple_choice' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options *</Label>
                    <Button 
                      type="button" 
                      onClick={addAnswerOption}
                      size="sm"
                      variant="outline"
                      disabled={formData.answer_options.length >= 6}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.answer_options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-600 w-8">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => updateAnswerOption(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                        </div>
                        {formData.answer_options.length > 2 && (
                          <Button
                            type="button"
                            onClick={() => removeAnswerOption(index)}
                            size="sm"
                            variant="outline"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="correct_answer">Correct Answer *</Label>
                    <Select 
                      value={formData.correct_answer} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.answer_options
                          .filter(option => option.trim())
                          .map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {String.fromCharCode(65 + index)}. {option}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* True/False Answer */}
              {formData.question_type === 'true_false' && (
                <div>
                  <Label htmlFor="correct_answer">Correct Answer *</Label>
                  <Select 
                    value={formData.correct_answer} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Fill in the Blank / Short Answer */}
              {(formData.question_type === 'fill_blank' || formData.question_type === 'short_answer') && (
                <div>
                  <Label htmlFor="correct_answer">Correct Answer *</Label>
                  <Input
                    id="correct_answer"
                    value={formData.correct_answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Explain why this is the correct answer (shown to students after answering)"
                />
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
                      Create Question
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