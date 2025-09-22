'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, FileQuestion, Plus, Trash2 } from 'lucide-react';

interface GrammarTopic {
  id: number;
  title: string;
  is_published: boolean;
  lesson_id?: number | null;
  interactive_data?: { questions?: any[] };
}

export default function GrammarEditPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [item, setItem] = useState<GrammarTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (topicId) fetchTopic();
  }, [topicId]);

  async function fetchTopic() {
    try {
      const res = await fetch(`/api/topics/${topicId}`);
      if (res.ok) setItem(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function updateQuestion(idx: number, patch: any) {
    if (!item) return;
    const qs = Array.isArray(item.interactive_data?.questions) ? [...item.interactive_data!.questions] : [];
    qs[idx] = { ...(qs[idx] || {}), ...patch };
    setItem({ ...item, interactive_data: { ...(item.interactive_data || {}), questions: qs } });
  }

  function addQuestion() {
    if (!item) return;
    const qs = Array.isArray(item.interactive_data?.questions) ? [...item.interactive_data!.questions] : [];
    qs.push({ question: '', options: ['A) ', 'B) ', 'C) ', 'D) '], correct_answer: 'A', explanation: '' });
    setItem({ ...item, interactive_data: { ...(item.interactive_data || {}), questions: qs } });
  }

  function deleteQuestion(idx: number) {
    if (!item) return;
    const qs = Array.isArray(item.interactive_data?.questions) ? [...item.interactive_data!.questions] : [];
    qs.splice(idx, 1);
    setItem({ ...item, interactive_data: { ...(item.interactive_data || {}), questions: qs } });
  }

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/topics/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, is_published: item.is_published, interactive_data: item.interactive_data })
      });
      if (res.ok) router.push(`/dashboard/content/grammar/${item.id}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !item) return <div className="p-6">Loading...</div>;

  const questions = Array.isArray(item.interactive_data?.questions) ? item.interactive_data!.questions : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/content/grammar/${item.id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Grammar</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSave} disabled={saving} className="ml-auto">
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Questions ({questions.length})</h2>
            <Button size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" /> Add Question
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((q: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <Label>Question {idx + 1}</Label>
                    <Button variant="destructive" size="sm" onClick={() => deleteQuestion(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input value={q.question || ''} onChange={(e) => updateQuestion(idx, { question: e.target.value })} placeholder="Question prompt in English" />
                  {(q.options || []).map((opt: string, oi: number) => (
                    <Input key={oi} value={opt} onChange={(e) => {
                      const opts = [...(q.options || [])];
                      opts[oi] = e.target.value;
                      updateQuestion(idx, { options: opts });
                    }} placeholder={`Option ${String.fromCharCode(65 + oi)} e.g., 'A) ...'`} />
                  ))}
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={q.correct_answer || 'A'} onChange={(e) => updateQuestion(idx, { correct_answer: e.target.value })} placeholder="Correct answer letter e.g., A" />
                    <Input value={q.explanation || ''} onChange={(e) => updateQuestion(idx, { explanation: e.target.value })} placeholder="Explanation" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
