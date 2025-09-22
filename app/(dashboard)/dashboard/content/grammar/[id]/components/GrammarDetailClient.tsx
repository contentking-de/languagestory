'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GrammarTopic {
  id: number;
  title: string;
  is_published: boolean;
  interactive_data?: any;
  lesson_id?: number | null;
}

export function GrammarDetailClient({ userRole }: { userRole: string }) {
  const [item, setItem] = useState<GrammarTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<Array<{ id: number; title: string }>>([]);

  useEffect(() => {
    const m = location.pathname.match(/\/grammar\/(\d+)/);
    const id = m ? parseInt(m[1]) : NaN;
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/topics/${id}`);
        if (res.ok) setItem(await res.json());
        const l = await fetch('/api/lessons/simple');
        if (l.ok) setLessons(await l.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/topics/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, is_published: item.is_published, interactive_data: item.interactive_data, lesson_id: item.lesson_id ?? null }),
      });
      if (!res.ok) alert(await res.text());
      else {
        const updated = await res.json();
        setItem(updated);
        alert('Saved');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!item) return <div className="p-6">Not found</div>;

  const exercises = item.interactive_data?.exercises || [];
  const questions = item.interactive_data?.questions || [];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grammar Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
            <Input value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
            <Badge className={item.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {item.is_published ? 'published' : 'draft'}
            </Badge>
            <Button variant="outline" onClick={() => setItem({ ...item, is_published: !item.is_published })}>
              Toggle Publish
            </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Assign to lesson:</span>
            <Select value={item.lesson_id == null ? 'none' : String(item.lesson_id)} onValueChange={(v) => setItem({ ...item, lesson_id: v === 'none' ? null : Number(v) })}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="No lesson (library only)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No lesson</SelectItem>
                {lessons.map(l => (
                  <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>

          <div className="space-y-3">
            {/* Multiple-choice grammar questions (read-only preview) */}
            {Array.isArray(questions) && questions.length > 0 && (
              <>
                {questions.map((q: any, i: number) => (
                  <Card key={`q-${i}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="text-xs text-gray-500">Multiple Choice</div>
                      <div className="font-medium">{q.question}</div>
                      <div className="text-sm space-y-1">
                        {(q.options || []).map((opt: string, idx: number) => (
                          <div key={idx}>{opt}</div>
                        ))}
                      </div>
                      <div className="text-sm text-gray-700">Correct: {q.correct_answer}</div>
                      {q.explanation && (
                        <div className="text-xs text-gray-500">Explanation: {q.explanation}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Legacy exercises editor */}
            {Array.isArray(exercises) && exercises.length > 0 && (
              <>
                {exercises.map((ex: any, idx: number) => (
                  <ExerciseEditor key={idx} ex={ex} onChange={(updated) => {
                    const next = [...exercises];
                    next[idx] = updated;
                    setItem({ ...item, interactive_data: { ...item.interactive_data, exercises: next } });
                  }} />
                ))}
              </>
            )}

            {(!questions || questions.length === 0) && (!exercises || exercises.length === 0) && (
              <div className="text-sm text-gray-500">No questions stored.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GrammarDetailClient;

function ExerciseEditor({ ex, onChange }: { ex: any; onChange: (v: any) => void }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-gray-500">Type</div>
            <Input value={ex.type || ''} onChange={(e) => onChange({ ...ex, type: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-gray-500">Difficulty</div>
            <Input value={ex.difficulty_level ?? ''} onChange={(e) => onChange({ ...ex, difficulty_level: Number(e.target.value) || 0 })} />
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Instruction</div>
          <Input value={ex.instruction || ''} onChange={(e) => onChange({ ...ex, instruction: e.target.value })} />
        </div>
        <div>
          <div className="text-xs text-gray-500">Question</div>
          <Input value={ex.question || ''} onChange={(e) => onChange({ ...ex, question: e.target.value })} />
        </div>
        <div>
          <div className="text-xs text-gray-500">Correct Answer</div>
          <Input value={ex.correct_answer || ''} onChange={(e) => onChange({ ...ex, correct_answer: e.target.value })} />
        </div>
        <div>
          <div className="text-xs text-gray-500">Explanation</div>
          <Input value={ex.explanation || ''} onChange={(e) => onChange({ ...ex, explanation: e.target.value })} />
        </div>
      </CardContent>
    </Card>
  );
}
