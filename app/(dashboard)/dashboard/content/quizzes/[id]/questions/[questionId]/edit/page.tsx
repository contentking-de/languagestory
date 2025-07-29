'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

export default function EditQuestionPage() {
  const params = useParams();
  const quizId = params.id as string;
  const questionId = params.questionId as string;

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
            Question ID: {questionId}
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Question Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Edit className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Question Editing Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              The question editing functionality is currently under development. For now, you can create new questions and manage them from the quiz overview.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/dashboard/content/quizzes/${quizId}`}>
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quiz
                </Button>
              </Link>
              <Link href={`/dashboard/content/quizzes/${quizId}/questions/create`}>
                <Button variant="outline">
                  Create New Question Instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 