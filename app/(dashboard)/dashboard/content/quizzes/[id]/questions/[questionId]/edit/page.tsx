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

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  correct_answer: string;
  answer_options: string[];
  explanation?: string;
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const questionId = params.questionId as string;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: '',
    points: 1,
    correct_answer: '',
    answer_options: ['', '', '', ''], // For multiple choice
    explanation: '',
  });

  useEffect(() => {
    if (quizId && questionId) {
      fetchQuizAndQuestion();
    }
  }, [quizId, questionId]);

  const fetchQuizAndQuestion = async () => {
    try {
      const [quizResponse, questionResponse] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/questions/${questionId}`)
      ]);

      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuiz(quizData);
      }

      if (questionResponse.ok) {
        const questionData = await questionResponse.json();
        setQuestion(questionData);
        
        // Populate form with existing question data
        setFormData({
          question_text: questionData.question_text || '',
          question_type: questionData.question_type || '',
          points: questionData.points || 1,
          correct_answer: questionData.correct_answer || '',
          answer_options: Array.isArray(questionData.answer_options) 
            ? questionData.answer_options 
            : (questionData.answer_options ? JSON.parse(questionData.answer_options) : ['', '', '', '']),
          explanation: questionData.explanation || '',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quiz_id: parseInt(quizId),
        }),
      });

      if (response.ok) {
        alert('Question updated successfully!');
        router.push(`/dashboard/content/quizzes/${quizId}`);
      } else {
        const error = await response.text();
        alert(`Failed to update question: ${error}`);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('An error occurred while updating the question. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.answer_options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, answer_options: newOptions }));
  };

  const addAnswerOption = () => {
    setFormData(prev => ({ 
      ...prev, 
      answer_options: [...prev.answer_options, ''] 
    }));
  };

  const removeAnswerOption = (index: number) => {
    if (formData.answer_options.length > 2) {
      const newOptions = formData.answer_options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, answer_options: newOptions }));
      
      // If the removed option was the correct answer, clear correct answer
      if (formData.correct_answer === formData.answer_options[index]) {
        setFormData(prev => ({ ...prev, correct_answer: '' }));
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!quiz || !question) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Question not found</p>
          <Link href={`/dashboard/content/quizzes/${quizId}`} className="mt-4 inline-block">
            <Button>Back to Quiz</Button>
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
            Back to Quiz
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
          <p className="text-gray-600 mt-1">
            {quiz.lesson_title && `${quiz.lesson_title} • `}{quiz.title}
          </p>
        </div>
      </div>

      {/* Question Form */}
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
              {/* Question Text */}
              <div>
                <Label htmlFor="question_text">Question Text *</Label>
                <Input
                  id="question_text"
                  type="text"
                  value={formData.question_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                  placeholder="Enter your question here..."
                  required
                  className="mt-1"
                />
              </div>

              {/* Question Type and Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="question_type">Question Type *</Label>
                  <Select 
                    value={formData.question_type} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        question_type: value,
                        answer_options: value === 'multiple_choice' ? ['', '', '', ''] : [''],
                        correct_answer: ''
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="points">Points *</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Multiple Choice Options */}
              {formData.question_type === 'multiple_choice' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Answer Options *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAnswerOption}
                      disabled={formData.answer_options.length >= 6}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.answer_options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleAnswerOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, correct_answer: option }))}
                          className={formData.correct_answer === option ? 'bg-green-100 border-green-500' : ''}
                        >
                          {formData.correct_answer === option ? 'Correct' : 'Set Correct'}
                        </Button>
                        {formData.answer_options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAnswerOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {!formData.correct_answer && (
                    <p className="text-sm text-red-600 mt-2">Please select the correct answer</p>
                  )}
                </div>
              )}

              {/* True/False Options */}
              {formData.question_type === 'true_false' && (
                <div>
                  <Label>Correct Answer *</Label>
                  <Select 
                    value={formData.correct_answer} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="True">True</SelectItem>
                      <SelectItem value="False">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Explanation */}
              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Input
                  id="explanation"
                  type="text"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why this answer is correct..."
                  className="mt-1"
                />
              </div>

              {/* Submit Button */}
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