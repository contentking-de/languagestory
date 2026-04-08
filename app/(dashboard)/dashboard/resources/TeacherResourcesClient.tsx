'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react';

interface LessonRow {
  id: number;
  title: string;
  slug: string;
  course_title: string;
  course_language: string;
  course_level: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  french: 'French',
  german: 'German',
  spanish: 'Spanish',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function TeacherResourcesClient() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState('all');
  const [level, setLevel] = useState('all');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/lessons');
        if (!res.ok) throw new Error('Could not load lessons.');
        const data = await res.json();
        if (!cancelled) setLessons(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError('Could not load lessons.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = lessons.filter((l) => {
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.course_title.toLowerCase().includes(q);
    const matchLang = lang === 'all' || l.course_language === lang;
    const matchLevel = level === 'all' || l.course_level === level;
    return matchQ && matchLang && matchLevel;
  });

  async function downloadPdf(lesson: LessonRow) {
    setError(null);
    setDownloadingId(lesson.id);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/worksheet-pdf`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Download failed.');
      }
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition');
      let filename = `worksheet_${lesson.id}.pdf`;
      const m = cd?.match(/filename="([^"]+)"/);
      if (m?.[1]) filename = m[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed.');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-600 mt-1">
              Download printable worksheets (PDF) for published lessons — including story texts,
              cultural content, and quiz questions for your learners. Language and level match each
              lesson&apos;s course.
            </p>
          </div>
        </div>
        <FileText className="h-8 w-8 text-blue-600 hidden sm:block flex-shrink-0" />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search lesson or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="german">German</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600 py-8 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading lessons…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600 py-6">No lessons match the current filters.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((lesson) => (
                <li
                  key={lesson.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{lesson.title}</p>
                    <p className="text-sm text-gray-600">{lesson.course_title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">
                        {LANGUAGE_LABELS[lesson.course_language] ?? lesson.course_language}
                      </Badge>
                      <Badge variant="outline">
                        {LEVEL_LABELS[lesson.course_level] ?? lesson.course_level}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="shrink-0"
                    disabled={downloadingId === lesson.id}
                    onClick={() => downloadPdf(lesson)}
                  >
                    {downloadingId === lesson.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    PDF
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
