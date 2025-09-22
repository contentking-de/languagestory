'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Eye, Search, Trash2 } from 'lucide-react';
import { FlagIcon, LanguageSelectOption } from '@/components/ui/flag-icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface GrammarTopic {
  id: number;
  title: string;
  points_value: number;
  is_published: boolean;
  created_at: string;
  lesson_id?: number;
  lesson_title?: string;
  course_title?: string;
  course_language?: string;
  exercises_count?: number;
  questions_count?: number;
  total_items?: number;
}

export function GrammarClient({ userRole }: { userRole: string }) {
  const [items, setItems] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');

  const canDelete = userRole === 'super_admin';

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    try {
      const res = await fetch('/api/grammar');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error('Error loading grammar topics', e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      (g.lesson_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.course_title || '').toLowerCase().includes(search.toLowerCase());
    const matchesLanguage =
      languageFilter === 'all' || (g.course_language || '') === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  async function handleDelete(id: number, title: string) {
    if (!canDelete) return;
    const confirmed = window.confirm(`Delete grammar item "${title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
        alert('Deleted');
      } else {
        const t = await res.text();
        alert(t || 'Failed to delete');
      }
    } catch (e) {
      console.error('Delete failed', e);
      alert('Delete failed');
    }
  }

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grammar Exercises</h1>
          <p className="text-gray-600 mt-1">Browse, edit, or delete saved grammar exercises</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search grammar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="french"><LanguageSelectOption language="french" /></SelectItem>
                <SelectItem value="german"><LanguageSelectOption language="german" /></SelectItem>
                <SelectItem value="spanish"><LanguageSelectOption language="spanish" /></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((g) => (
          <Card key={g.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  <div>
                    <CardTitle className="text-lg line-clamp-2">{g.title}</CardTitle>
                    <Badge className={g.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {g.is_published ? 'published' : 'draft'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {g.course_language && (
                    <FlagIcon language={g.course_language} size="lg" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {g.lesson_title && (
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{g.lesson_title}</span>
                </div>
              )}
              <div className="text-sm text-gray-600">Items: {g.total_items ?? g.questions_count ?? g.exercises_count ?? 0}</div>

              <div className="flex gap-2 pt-2">
                <Link href={`/dashboard/content/grammar/${g.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </Link>
                <Link href={`/dashboard/content/grammar/${g.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </Link>
                {canDelete && (
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(g.id, g.title)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default GrammarClient;


