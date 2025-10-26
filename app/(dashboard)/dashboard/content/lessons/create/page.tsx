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
  BookOpen,
  Info,
  Wand2,
  Image as ImageIcon,
  Languages,
} from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Course {
  id: number;
  title: string;
  language: string;
  level: string;
}

function CreateLessonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourseId = searchParams.get('courseId');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    lesson_type: 'story',
    lesson_order: 1,
    estimated_duration: 30,
    points_value: 350,
    is_published: false,
    course_id: preselectedCourseId ? parseInt(preselectedCourseId) : 0,
  });
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(0); // 0 Basics, 1 Vocab, 2 Cultural, 3 Images, 4 Games, 5 Grammar, 6 MC Quiz, 7 True/False, 8 Gap Fill
  const [aiBusy, setAiBusy] = useState(false);
  const [vocabTopic, setVocabTopic] = useState('');
  const [vocabQuantity, setVocabQuantity] = useState(10);
  const [culturalTopic, setCulturalTopic] = useState('');
  const [manualVocab, setManualVocab] = useState<{target:string; english:string; context?:string; type?:string}[]>([]);
  const addEmptyVocab = () => setManualVocab(prev => [...prev, {target:'', english:'', context:'', type:''}]);
  const updateManualVocab = (idx:number, key:'target'|'english'|'context'|'type', val:string) => {
    setManualVocab(prev => prev.map((v,i)=> i===idx ? {...v, [key]: val} : v));
  };
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [lastMessage, setLastMessage] = useState('');
  const [vocabPreview, setVocabPreview] = useState<any[]>([]);
  const [culturalPreview, setCulturalPreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [quizQuantity, setQuizQuantity] = useState(5);
  const [quizName, setQuizName] = useState('');
  const [quizPreview, setQuizPreview] = useState<string>('');
  const [tfQuantity, setTfQuantity] = useState(10);
  const [tfName, setTfName] = useState('');
  const [tfPreview, setTfPreview] = useState<string>('');
  const [grammarQuantity, setGrammarQuantity] = useState(8);
  const [grammarName, setGrammarName] = useState('');
  const [grammarPreview, setGrammarPreview] = useState<string>('');
  const [gfNumGaps, setGfNumGaps] = useState(8);
  const [gfPreview, setGfPreview] = useState<string>('');
  const [hangmanWord, setHangmanWord] = useState<string>('');
  const [hangmanHint, setHangmanHint] = useState<string>('');
  // Combined Games creation state
  const [creatingGames, setCreatingGames] = useState(false);
  const [gamesProgress, setGamesProgress] = useState<{
    wordSearch: 'idle' | 'pending' | 'success' | 'error';
    memory: 'idle' | 'pending' | 'success' | 'error';
    vocabRun: 'idle' | 'pending' | 'success' | 'error';
    listenType: 'idle' | 'pending' | 'success' | 'error';
    hangman: 'idle' | 'pending' | 'success' | 'error';
  }>({ wordSearch: 'idle', memory: 'idle', vocabRun: 'idle', listenType: 'idle', hangman: 'idle' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses/simple');
      if (response.ok) {
        const coursesData = await response.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newLesson = await response.json();
        setLessonId(newLesson.id);
        setCurrentStep(1);
        setLastMessage('Basics saved. Continue with Vocabulary.');
      } else {
        console.error('Failed to create lesson');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
    } finally {
      setCreating(false);
    }
  };

  // Incremental save of basics when moving forward (PUT)
  const saveBasicsIfDraftExists = async () => {
    if (!lessonId) return;
    try {
      await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (e) {
      console.error('Autosave basics failed', e);
    }
  };

  const selectedCourse = courses.find(c => c.id === formData.course_id);
  const courseLanguage = selectedCourse?.language || '';
  const courseLevel = selectedCourse?.level || '';

  const getLanguageFlag = (language: string) => {
    const flags = {
      french: '🇫🇷',
      german: '🇩🇪',
      spanish: '🇪🇸'
    };
    return flags[language as keyof typeof flags] || '🌐';
  };

  // Helper: append newly created item to lesson's flow_order
  const appendToFlow = async (item: { type: 'quiz' | 'game' | 'content' | 'cultural' | 'vocab' | 'grammar'; id?: number }) => {
    try {
      if (!lessonId) return;
      const res = await fetch(`/api/lessons/${lessonId}`);
      if (!res.ok) return;
      const lessonData = await res.json();
      const currentFlow = Array.isArray(lessonData?.flow_order) ? lessonData.flow_order : [];
      const exists = currentFlow.some((it: any) => it?.type === item.type && (item.id ? it?.id === item.id : true));
      const newFlow = exists ? currentFlow : [...currentFlow, item];
      await fetch(`/api/lessons/${lessonId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flow_order: newFlow }) });
    } catch (e) {
      console.warn('appendToFlow failed', e);
    }
  };

  // Finalize flow order after creation: vocab, content, cultural, quizzes, games, grammar
  const finalizeFlowOrder = async () => {
    try {
      if (!lessonId) return;
      const [lessonRes, quizzesRes, gamesRes] = await Promise.all([
        fetch(`/api/lessons/${lessonId}`),
        fetch(`/api/lessons/${lessonId}/quizzes`),
        fetch(`/api/lessons/${lessonId}/games`)
      ]);
      const lessonData = lessonRes.ok ? await lessonRes.json() : {};
      const quizzesData = quizzesRes.ok ? await quizzesRes.json() : [];
      const gamesData = gamesRes.ok ? await gamesRes.json() : [];
      const flow: Array<{ key: string; type: 'content' | 'cultural' | 'quiz' | 'game' | 'grammar' | 'vocab'; id?: number; title?: string }> = [];
      if (Array.isArray(lessonData?.vocabulary) && lessonData.vocabulary.length > 0) flow.push({ key: 'vocab', type: 'vocab', title: 'Vocabulary Trainer' });
      if (lessonData?.content) flow.push({ key: 'content', type: 'content', title: 'Lesson Content' });
      if (lessonData?.cultural_information) flow.push({ key: 'cultural', type: 'cultural', title: 'Cultural Information' });
      quizzesData.forEach((q: any) => flow.push({ key: `quiz-${q.id}`, type: 'quiz', id: q.id, title: q.title }));
      gamesData.forEach((g: any) => flow.push({ key: `game-${g.id}`, type: 'game', id: g.id, title: g.title }));
      if (Array.isArray(lessonData?.grammar)) lessonData.grammar.forEach((gr: any) => flow.push({ key: `grammar-${gr.id}`, type: 'grammar', id: gr.id, title: gr.title }));
      // Persist locally for the overview page immediate display
      try { window.localStorage.setItem(`lesson_flow_order_${lessonId}`, JSON.stringify(flow)); } catch {}
      // Persist to server
      await fetch(`/api/lessons/${lessonId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flow_order: flow }) });
    } catch (e) {
      console.warn('finalizeFlowOrder failed', e);
    }
  };

  const isFormValid = formData.title && formData.slug && formData.lesson_type && formData.course_id > 0;

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
        <Link href="/dashboard/content/lessons">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Lesson</h1>
          <p className="text-gray-600 mt-1">
            Add a new lesson to your language learning course
          </p>
        </div>
      </div>

      {/* Builder */}
      <div className="max-w-6xl">
        {/* Stepper */}
        <div className="grid gap-2 mb-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 xl:grid-cols-10">
          {[
            { key: 0, title: 'Basics' },
            { key: 1, title: 'Vocabulary' },
            { key: 2, title: 'Cultural' },
            { key: 3, title: 'Images' },
            { key: 4, title: 'Games' },
            { key: 5, title: 'Grammar' },
            { key: 6, title: 'MC Quiz' },
            { key: 7, title: 'True/False' },
            { key: 8, title: 'Gap Fill' },
          ].map((s) => (
            <div key={s.key} className={`p-2 rounded-md border text-xs text-center ${currentStep === (s.key as any) ? 'border-orange-500 bg-orange-50 font-medium' : 'border-gray-200 bg-white'}`}>
              <span className="mr-1 text-[10px] align-middle">{(s.key as number) + 1}.</span>
              <span className="align-middle">{s.title}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {currentStep === 0 && 'Lesson Information'}
              {currentStep === 1 && 'Vocabulary'}
              {currentStep === 2 && 'Cultural Information'}
              {currentStep === 3 && 'Images'}
              {currentStep === 4 && 'Create Games'}
              {currentStep === 5 && 'Grammar Exercises'}
              {currentStep === 6 && 'Multiple Choice Quiz'}
              {currentStep === 7 && 'True/False Quiz'}
              {currentStep === 8 && 'Gap Fill Quiz'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <form onSubmit={handleSubmit} className="space-y-6">
              {aiBusy && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                  <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                  <div className="text-sm text-yellow-800">
                    Creating... this might take some time! Grab a coffee and please wait for results.
                  </div>
                </div>
              )}
              {/* Course Selection */}
              <div>
                <Label htmlFor="course">Course *</Label>
                <Select 
                  value={formData.course_id.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: parseInt(value) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{getLanguageFlag(course.language)}</span>
                          <span>{course.title}</span>
                          <span className="text-xs text-gray-500">({course.level})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourse && (
                  <p className="text-sm text-gray-600 mt-1">
                    Adding lesson to: {getLanguageFlag(selectedCourse.language)} {selectedCourse.title} ({selectedCourse.level})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                    className="mt-1"
                    placeholder="e.g., Introduction to French Greetings"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Lesson Slug *</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="mt-1 font-mono"
                    placeholder="introduction-to-french-greetings"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-generated from title
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief description of what students will learn..."
                />
              </div>

              <div>
                <Label htmlFor="content">Lesson Content</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  placeholder="Enter the lesson content here... You can add text, instructions, examples, etc."
                />
                <p className="text-sm text-gray-500 mt-1">
                  The main content that students will see during the lesson
                </p>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={aiBusy || !formData.title || !selectedCourse}
                    onClick={async () => {
                      if (!selectedCourse || !formData.title) return;
                      setAiBusy(true);
                      setLastMessage('');
                      try {
                        const topicBase = formData.description || formData.title;
                        const gen = await fetch('/api/ai/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            contentType: 'story',
                            aiProvider: 'openai',
                            language: selectedCourse.language,
                            level: selectedCourse.level,
                            topic: topicBase,
                            quantity: 1,
                          }),
                        });
                        const g = await gen.json();
                        const storyText = g?.data?.story?.content || '';
                        const storyTitle = g?.data?.story?.title || '';
                        if (storyText) {
                          setFormData(prev => ({
                            ...prev,
                            content: storyText,
                            description: prev.description || storyTitle,
                          }));
                          setLastMessage('Story content generated and inserted based on title, language and level.');
                        } else {
                          setLastMessage('No story content returned.');
                        }
                      } catch (e) {
                        console.error(e);
                        setLastMessage('Failed to generate story content');
                      } finally {
                        setAiBusy(false);
                      }
                    }}
                  >
                    <Wand2 className="h-4 w-4 mr-2" /> Generate Story from Title (AI)
                  </Button>
                  {lastMessage && (
                    <div className="text-xs text-gray-600 mt-1">{lastMessage}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lesson_type">Lesson Type *</Label>
                  <Select 
                    value={formData.lesson_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, lesson_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lesson_order">Lesson Order</Label>
                  <Input
                    id="lesson_order"
                    type="number"
                    min="1"
                    value={formData.lesson_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, lesson_order: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                    placeholder="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Position in the course
                  </p>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="points">Points Value</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={formData.points_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, points_value: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                  placeholder="10"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Points students will earn for completing this lesson
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
                <Label htmlFor="published">Publish this lesson immediately</Label>
                <p className="text-sm text-gray-500">
                  (You can also publish it later)
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your lesson will be added to the selected course</li>
                    <li>• You can add quizzes and interactive elements</li>
                    <li>• Students will see it in their course progression</li>
                    <li>• You can reorder lessons within the course later</li>
                  </ul>
                </div>
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
                      Save & Continue
                    </>
                  )}
                </Button>
                <Link href="/dashboard/content/lessons">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                {aiBusy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                    <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                    <div className="text-sm text-yellow-800">
                      Creating... this might take some time! Grab a coffee and please wait for results and do not go to the next step!
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Select value={vocabQuantity.toString()} onValueChange={(v)=>setVocabQuantity(parseInt(v))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[5,10,15,20].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button disabled={!lessonId || aiBusy} onClick={async()=>{
                      if (!lessonId) return;
                      setAiBusy(true);
                      setLastMessage('');
                      try {
                        const topicBase = (formData.content || '').toString().slice(0, 800) || formData.title || 'lesson content';
                        const gen = await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'vocabulary',aiProvider:'openai',language:courseLanguage,level:courseLevel,topic:topicBase,quantity:vocabQuantity})});
                        const g = await gen.json();
                        if (g?.data) {
                          setVocabPreview(Array.isArray(g.data.words) ? g.data.words : []);
                          const save = await fetch('/api/ai/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'vocabulary',data:g.data,lessonId})});
                          const s = await save.json();
                          setLastMessage(`Saved ${s?.count ?? 0} vocabulary items.`);
                        }
                      } catch(e){ console.error(e); setLastMessage('Failed to generate/save vocabulary'); }
                      finally{ setAiBusy(false); }
                    }} className="w-full">
                      <Wand2 className="h-4 w-4 mr-2"/>Generate & Save
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Vocabulary is generated from your lesson content saved in Basics.</p>

                {vocabPreview.length > 0 && (
                  <div className="bg-gray-50 rounded-md p-3 max-h-60 overflow-auto">
                    <div className="text-sm font-medium mb-2">Preview</div>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      {vocabPreview.slice(0,50).map((w:any, i:number)=>{
                        const target = w.word_german || w.word_french || w.word_spanish || w.word_english || '';
                        return (
                          <li key={i}>{target} {w.word_english ? `- ${w.word_english}` : ''}</li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Manual add */}
                <div className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium">Add vocabulary manually</div>
                    <Button type="button" variant="outline" size="sm" onClick={addEmptyVocab}>Add Row</Button>
                  </div>
                  <div className="space-y-3">
                    {manualVocab.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input placeholder={`${courseLanguage || 'target'} word`} value={item.target} onChange={(e)=>updateManualVocab(idx,'target',e.target.value)} />
                        <Input placeholder="English" value={item.english} onChange={(e)=>updateManualVocab(idx,'english',e.target.value)} />
                        <Input placeholder="Context sentence (optional)" value={item.context} onChange={(e)=>updateManualVocab(idx,'context',e.target.value)} />
                        <Input placeholder="Type (noun/verb/...)" value={item.type} onChange={(e)=>updateManualVocab(idx,'type',e.target.value)} />
                      </div>
                    ))}
                  </div>
                  {manualVocab.length > 0 && (
                    <div className="mt-3">
                      <Button type="button" onClick={async()=>{
                        if (!lessonId) return;
                        const payloads = manualVocab.filter(v=>v.english || v.target);
                        if (payloads.length === 0) return;
                        try{
                          let saved = 0;
                          for (const v of payloads){
                            const body:any = { word_english: v.english, word_type: v.type || null, context_sentence: v.context || null, lesson_id: lessonId };
                            // map target to proper field
                            if (courseLanguage === 'german') body.word_german = v.target; else if (courseLanguage === 'french') body.word_french = v.target; else if (courseLanguage === 'spanish') body.word_spanish = v.target; else body.word_english = v.english || v.target;
                            const res = await fetch('/api/vocabulary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
                            if (res.ok) saved++;
                          }
                          setManualVocab([]);
                          setLastMessage(`Saved ${saved} manual vocabulary items.`);
                        }catch(e){ console.error(e); setLastMessage('Failed to save manual vocabulary'); }
                      }}>Save Manual Vocabulary</Button>
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={async()=>{ await saveBasicsIfDraftExists(); setCurrentStep(0);}}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={()=>setCurrentStep(2)}>Next</Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {aiBusy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                    <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                    <div className="text-sm text-yellow-800">
                      Creating... this might take some time! Grab a coffee and please wait for results and do not go to the next step!
                    </div>
                  </div>
                )}
                <div>
                  <Label>Keyword, Topic or Theme</Label>
                  <Input value={culturalTopic} onChange={(e)=>setCulturalTopic(e.target.value)} className="mt-1" placeholder="e.g., Berlin etiquette" />
                </div>
                <Button disabled={!lessonId || aiBusy || !culturalTopic} onClick={async()=>{
                  if (!lessonId) return; setAiBusy(true); setLastMessage('');
                  try{
                    const gen = await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'cultural',aiProvider:'openai',language:courseLanguage,level:courseLevel,topic:culturalTopic,quantity:1})});
                    const g = await gen.json();
                    if (g?.data) {
                      setCulturalPreview(g.data.cultural_information || '');
                      const save = await fetch('/api/ai/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'cultural',data:g.data,lessonId})});
                      const s = await save.json();
                      setLastMessage('Cultural information saved.');
                    }
                  }catch(e){console.error(e); setLastMessage('Failed to generate/save cultural info');}
                  finally{setAiBusy(false);} }}>
                  <Wand2 className="h-4 w-4 mr-2"/>Generate & Save
                </Button>
                {culturalPreview && (
                  <div className="bg-gray-50 rounded-md p-3 max-h-60 overflow-auto">
                    <div className="text-sm font-medium mb-2">Preview</div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{culturalPreview}</pre>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={()=>setCurrentStep(1)}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={()=>setCurrentStep(3)}>Next</Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                {aiBusy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                    <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                    <div className="text-sm text-yellow-800">
                      Creating... this might take some time! Grab a coffee and please wait for results and do not go to the next step!
                    </div>
                  </div>
                )}
                <div>
                  <Label>Image Prompt</Label>
                  <Input value={imagePrompt} onChange={(e)=>setImagePrompt(e.target.value)} className="mt-1" placeholder="Describe the image to generate" />
                </div>
                {/* Avatar selection (optional) */}
                <div className="space-y-2">
                  <Label>Choose an avatar (optional)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {['johnny.png','nico.png','carlos.png','carla.png','annie.png','matthieu.png'].map((file)=> (
                      <button
                        key={file}
                        type="button"
                        onClick={()=> setSelectedAvatar(prev => prev === file ? '' : file)}
                        className={`border rounded-md p-2 flex flex-col items-center gap-2 hover:bg-gray-50 focus:outline-none ${selectedAvatar === file ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                        title={file.replace('.png','')}
                      >
                        <img src={`/${file}`} alt={file} className="h-16 w-16 object-cover rounded" />
                        <span className="text-xs text-gray-700 capitalize">{file.replace('.png','')}</span>
                      </button>
                    ))}
                  </div>
                  {selectedAvatar && (
                    <div className="text-xs text-gray-600">Selected avatar: <span className="font-medium">{selectedAvatar.replace('.png','')}</span></div>
                  )}
                </div>
                <Button disabled={!lessonId || aiBusy || !imagePrompt} onClick={async()=>{
                  if (!lessonId) return; setAiBusy(true); setLastMessage('');
                  try{
                    const gen = await fetch('/api/ai/generate',{
                      method:'POST',
                      headers:{'Content-Type':'application/json'},
                      body:JSON.stringify({
                        contentType:'image',
                        aiProvider:'gpt5',
                        topic:imagePrompt,
                        avatarFile: selectedAvatar // optional
                      })
                    });
                    const g = await gen.json();
                    if (g?.preview) {
                      setImagePreview(g.preview);
                      const base64 = (g.preview as string).split(',')[1] || '';
                      const save = await fetch('/api/ai/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'image',data:{base64},imagePrompt,lessonId})});
                      const s = await save.json();
                      // set as cover image
                      if (s?.savedUrl) {
                        await fetch(`/api/lessons/${lessonId}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({cover_image:s.savedUrl})});
                        setLastMessage('Image saved and set as cover.');
                      } else {
                        setLastMessage('Image saved. You can set it as cover later.');
                      }
                    }
                  }catch(e){console.error(e); setLastMessage('Failed to generate/save image');}
                  finally{setAiBusy(false);} }}>
                  <ImageIcon className="h-4 w-4 mr-2"/>Generate & Save
                </Button>
                {imagePreview && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm font-medium mb-2">Preview</div>
                    <img src={imagePreview} alt="Generated" className="rounded-md max-h-72" />
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={()=>setCurrentStep(2)}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={()=>setCurrentStep(4)}>Next</Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="text-sm text-gray-700 mb-3">Automatically create a set of games for this lesson (Word Search, Memory, Vocab Run, Hangman). We will show progress for each game.</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm"><div className={`w-2 h-2 rounded-full ${gamesProgress.wordSearch==='success'?'bg-green-500':gamesProgress.wordSearch==='error'?'bg-red-500':gamesProgress.wordSearch==='pending'?'bg-yellow-400':'bg-gray-300'}`}></div><span>Word Search</span></div>
                    <div className="flex items-center gap-2 text-sm"><div className={`w-2 h-2 rounded-full ${gamesProgress.memory==='success'?'bg-green-500':gamesProgress.memory==='error'?'bg-red-500':gamesProgress.memory==='pending'?'bg-yellow-400':'bg-gray-300'}`}></div><span>Memory</span></div>
                    <div className="flex items-center gap-2 text-sm"><div className={`w-2 h-2 rounded-full ${gamesProgress.vocabRun==='success'?'bg-green-500':gamesProgress.vocabRun==='error'?'bg-red-500':gamesProgress.vocabRun==='pending'?'bg-yellow-400':'bg-gray-300'}`}></div><span>Vocab Run</span></div>
                    <div className="flex items-center gap-2 text-sm"><div className={`w-2 h-2 rounded-full ${gamesProgress.listenType==='success'?'bg-green-500':gamesProgress.listenType==='error'?'bg-red-500':gamesProgress.listenType==='pending'?'bg-yellow-400':'bg-gray-300'}`}></div><span>Listen & Type</span></div>
                    <div className="flex items-center gap-2 text-sm"><div className={`w-2 h-2 rounded-full ${gamesProgress.hangman==='success'?'bg-green-500':gamesProgress.hangman==='error'?'bg-red-500':gamesProgress.hangman==='pending'?'bg-yellow-400':'bg-gray-300'}`}></div><span>Hangman</span></div>
                  </div>
                  <div className="mt-3">
                    <Button disabled={!lessonId || creatingGames} onClick={async()=>{
                      if (!lessonId) return;
                      setCreatingGames(true);
                      setGamesProgress({ wordSearch:'pending', memory:'idle', vocabRun:'idle', listenType:'idle', hangman:'idle' });
                      setLastMessage('');
                      try{
                        // Load lesson and vocab once
                      const lessonRes = await fetch(`/api/lessons/${lessonId}`);
                      const lessonData = await lessonRes.json();
                      const language = (lessonData?.course_language || '').toLowerCase();
                        const vocab = Array.isArray(lessonData?.vocabulary) ? lessonData.vocabulary : [];
                      const langKey = language === 'german' ? 'word_german' : language === 'french' ? 'word_french' : language === 'spanish' ? 'word_spanish' : 'word_english';
                        if (vocab.length === 0){ throw new Error('No vocabulary found for this lesson.'); }

                        // 1) Word Search
                        try{
                          const shuffled = [...vocab].sort(()=>Math.random()-0.5).slice(0, Math.min(4, vocab.length));
                          const stripArticleAndToSingleWord = (raw: string): string => {
                            let s = (raw || '').toString().trim();
                            if (!s) return '';
                            if (language === 'german') s = s.replace(/^(der|die|das)\s+/i, '');
                            else if (language === 'french'){ s = s.replace(/^(le|la|les)\s+/i, ''); s = s.replace(/^l['’]/i, ''); }
                            else if (language === 'spanish') s = s.replace(/^(el|la|los|las)\s+/i, '');
                            s = s.split(/\s+/)[0];
                            return s;
                          };
                          const wsWords = shuffled.map((v:any)=> stripArticleAndToSingleWord((v?.[langKey] || v?.word_english || '').toString())).filter(Boolean);
                          const wsBody = { title: `${lessonData?.title || 'Lesson'} - Word Search`, description: `Auto-created word search for lesson ${lessonId}`, language, category: 'vocabulary', difficulty_level: 1, estimated_duration: 5, lesson_id: lessonId.toString(), game_type: 'word_search', game_config: { wordSearch: { words: wsWords, gridSize: 15, directions: ['horizontal','vertical','diagonal'] } }, provider_name: 'Custom' };
                          const wsRes = await fetch('/api/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(wsBody)});
                          if (!wsRes.ok) throw new Error('Word Search creation failed');
                          const wsCreated = await wsRes.json();
                          await appendToFlow({ type: 'game', id: wsCreated?.id });
                          setGamesProgress(prev=>({ ...prev, wordSearch:'success', memory:'pending' }));
                        }catch(e){ setGamesProgress(prev=>({ ...prev, wordSearch:'error', memory:'pending' })); }

                        // 2) Memory
                        try{
                          const memShuffled = [...vocab].sort(()=>Math.random()-0.5).slice(0, Math.min(12, vocab.length));
                          const cards = memShuffled.map((v:any, idx:number)=> ({ id: `${v.id || idx}`, word: (v?.[langKey] || v?.word_english || '').toString(), translation: (v?.word_english || '').toString() }));
                          const memBody = { title: `${lessonData?.title || 'Lesson'} - Memory`, description: `Auto-created memory game for lesson ${lessonId}`, language, category: 'vocabulary', difficulty_level: 1, estimated_duration: 5, lesson_id: lessonId.toString(), game_type: 'memory', game_config: { memory: { cards, gridSize: 4, timeLimit: 120 } }, provider_name: 'Custom' };
                          const memRes = await fetch('/api/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(memBody)});
                          if (!memRes.ok) throw new Error('Memory creation failed');
                          const memCreated = await memRes.json();
                          await appendToFlow({ type: 'game', id: memCreated?.id });
                          setGamesProgress(prev=>({ ...prev, memory:'success', vocabRun:'pending' }));
                        }catch(e){ setGamesProgress(prev=>({ ...prev, memory:'error', vocabRun:'pending' })); }

                        // 3) Vocab Run
                        try{
                          type Pair = { target: string; english: string };
                          const pairs: Pair[] = vocab
                            .map((v:any)=> ({ target: (v?.[langKey] || v?.word_english || '').toString(), english: (v?.word_english || '').toString() }))
                            .filter((p: Pair)=> !!p.target);
                          const pick = <T,>(arr:T[], n:number): T[] => [...arr].sort(()=>Math.random()-0.5).slice(0, n);
                          const base: Pair[] = pick<Pair>(pairs, Math.min(12, pairs.length));
                          const questions = base.map((item: Pair)=>{
                            const correct = item.target;
                            const distractors = pick<Pair>(pairs.filter((p)=> p.target !== correct), 2).map((p)=> p.target);
                            const opts = [correct, ...distractors].sort(()=>Math.random()-0.5);
                            const prompt = item.english || correct;
                            return { question: `Choose the correct word for: ${prompt}`, options: opts, correctIndex: opts.indexOf(correct) };
                          });
                          const vrBody = { title: `${lessonData?.title || 'Lesson'} - Vocab Run`, description: `Auto-created Vocab Run for lesson ${lessonId}`, language, category: 'vocabulary', difficulty_level: 1, estimated_duration: 5, lesson_id: lessonId.toString(), game_type: 'vocab_run', game_config: { vocabRun: { questions } }, provider_name: 'Custom' };
                          const vrRes = await fetch('/api/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(vrBody)});
                          if (!vrRes.ok) throw new Error('Vocab Run creation failed');
                          const vrCreated = await vrRes.json();
                          await appendToFlow({ type: 'game', id: vrCreated?.id });
                          setGamesProgress(prev=>({ ...prev, vocabRun:'success', listenType:'pending' }));
                        }catch(e){ setGamesProgress(prev=>({ ...prev, vocabRun:'error', listenType:'pending' })); }

                        // 4) Listen & Type (5 random vocab)
                        try{
                          const items = [...vocab]
                            .sort(()=>Math.random()-0.5)
                            .slice(0, Math.min(5, vocab.length))
                            .map((v:any, idx:number)=> ({
                              id: `${v.id || idx}`,
                              word: (v?.[langKey] || v?.word_english || '').toString(),
                              language,
                              vocabularyId: v?.id || null,
                            }))
                            .filter((it:any)=> !!it.word);
                          if (items.length > 0){
                            const ltBody = { title: `${lessonData?.title || 'Lesson'} - Listen & Type`, description: `Auto-created Listen & Type for lesson ${lessonId}`, language, category: 'vocabulary', difficulty_level: 1, estimated_duration: 5, lesson_id: lessonId.toString(), game_type: 'listen_type', game_config: { listenType: { items } }, provider_name: 'Custom' };
                            const ltRes = await fetch('/api/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ltBody)});
                            if (!ltRes.ok) throw new Error('Listen & Type creation failed');
                            const ltCreated = await ltRes.json();
                            await appendToFlow({ type: 'game', id: ltCreated?.id });
                          }
                          setGamesProgress(prev=>({ ...prev, listenType:'success', hangman:'pending' }));
                        }catch(e){ setGamesProgress(prev=>({ ...prev, listenType:'error', hangman:'pending' })); }

                        // 5) Hangman
                        try{
                          const choice = vocab[Math.floor(Math.random()*vocab.length)];
                          const rawWord = (choice?.[langKey] || choice?.word_english || '').toString();
                          const sanitizeForHangman = (w: string): string => {
                            let s = (w || '').toString().trim();
                            if (!s) return '';
                            if (language === 'german') s = s.replace(/^(der|die|das)\s+/i, '');
                            else if (language === 'french'){ s = s.replace(/^(le|la|les)\s+/i, ''); s = s.replace(/^l['’]/i, ''); }
                            else if (language === 'spanish') s = s.replace(/^(el|la|los|las)\s+/i, '');
                            s = s.normalize('NFKD').replace(/[^A-Za-zÀ-ÖØ-öø-ÿß]/g, '');
                            return s;
                          };
                          const word = sanitizeForHangman(rawWord);
                          if (!word) throw new Error('Selected word unsuitable for Hangman');
                          const basis = ((formData.description || '') + '\n' + (formData.content || '')).slice(0, 1200);
                          const gen = await fetch('/api/ai/generate',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contentType:'hint', aiProvider:'openai', language:'english', level:courseLevel || 'beginner', topic: `Target word: ${word}\n${basis}`, quantity:1 }) });
                          const g = await gen.json();
                          const rawHint = (g?.data?.hint || g?.preview || '').toString();
                          const sanitized = rawHint.replace(new RegExp(word,'i'),'').trim();
                          const hint = (sanitized || 'Guess the word!').slice(0,80);
                          const hmBody = { title: `${lessonData?.title || 'Lesson'} - Hangman`, description: `Auto-created hangman for lesson ${lessonId}`, language, category: 'vocabulary', difficulty_level: 1, estimated_duration: 5, lesson_id: lessonId.toString(), game_type: 'hangman', game_config: { hangman: { words: [word], hints: [hint], maxAttempts: 6, categories: ['lesson'] } }, provider_name: 'Custom' };
                          const hmRes = await fetch('/api/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(hmBody)});
                          if (!hmRes.ok) throw new Error('Hangman creation failed');
                          const hmCreated = await hmRes.json();
                          await appendToFlow({ type: 'game', id: hmCreated?.id });
                          setGamesProgress(prev=>({ ...prev, hangman:'success' }));
                          setLastMessage('All games created.');
                        }catch(e){ setGamesProgress(prev=>({ ...prev, hangman:'error' })); }
                      }catch(e:any){ setLastMessage(e?.message || 'Game creation failed'); }
                      finally{ setCreatingGames(false); }
                    }}>
                      {creatingGames ? 'Creating…' : 'Create Games'}
                  </Button>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={()=>setCurrentStep(3)}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={()=>setCurrentStep(5)} disabled={creatingGames}>Next</Button>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                {aiBusy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                    <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                    <div className="text-sm text-yellow-800">
                      Creating... this might take some time! Grab a coffee and please wait for results and do not go to the next step!
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Grammar Name (optional)</Label>
                    <Input value={grammarName} onChange={(e)=>setGrammarName(e.target.value)} className="mt-1" placeholder={`${formData.title || 'Lesson'} - Grammar Exercises`} />
                  </div>
                  <div>
                    <Label>Questions</Label>
                    <Select value={grammarQuantity.toString()} onValueChange={(v)=>setGrammarQuantity(parseInt(v))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[5,8,10,12,15].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button disabled={!lessonId || aiBusy} onClick={async()=>{
                  if (!lessonId) return; setAiBusy(true); setLastMessage(''); setGrammarPreview('');
                  try{
                    const topicBase = (formData.content || '').toString().slice(0, 1200) || formData.title || 'lesson content';
                    const gen = await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'grammar',aiProvider:'openai',language:courseLanguage,level:courseLevel,topic:topicBase,quantity:grammarQuantity})});
                    const g = await gen.json();
                    if (g?.data) {
                      setGrammarPreview(g.preview || '');
                      const save = await fetch('/api/ai/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'grammar',data:g.data,lessonId,customName: grammarName || `${formData.title || 'Lesson'} - Grammar Exercises`})});
                      await save.json();
                      try {
                        const lessonRes = await fetch(`/api/lessons/${lessonId}`);
                        const lessonData = await lessonRes.json();
                        const grammarArr = Array.isArray(lessonData?.grammar) ? lessonData.grammar : [];
                        const lastGrammar = grammarArr[grammarArr.length-1];
                        if (lastGrammar?.id) await appendToFlow({ type: 'grammar', id: lastGrammar.id });
                        setLastMessage(`Grammar exercises created with ${grammarQuantity} questions.`);
                      } catch {}
                    }
                  }catch(e){ console.error(e); setLastMessage('Failed to generate/save grammar exercises'); }
                  finally{ setAiBusy(false); }
                }}>
                  <Wand2 className="h-4 w-4 mr-2"/>Generate & Save Grammar
                </Button>
                {grammarPreview && (
                  <div className="bg-gray-50 rounded-md p-3 max-h-72 overflow-auto">
                    <div className="text-sm font-medium mb-2">Preview</div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{grammarPreview}</pre>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={()=>setCurrentStep(4)}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={()=>setCurrentStep(6)}>Next</Button>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                {aiBusy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                    <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                    <div className="text-sm text-yellow-800">
                      Creating... this might take some time! Grab a coffee and please wait for results and do not go to the next step!
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Quiz Name (optional)</Label>
                    <Input value={quizName} onChange={(e)=>setQuizName(e.target.value)} className="mt-1" placeholder={`${formData.title || 'Lesson'} - Quiz`} />
                  </div>
                  <div>
                    <Label>Questions</Label>
                    <Select value={quizQuantity.toString()} onValueChange={(v)=>setQuizQuantity(parseInt(v))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[5,10,15].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button disabled={!lessonId || aiBusy} onClick={async()=>{
                  if (!lessonId) return; setAiBusy(true); setLastMessage(''); setQuizPreview('');
                  try{
                    const topicBase = (formData.content || '').toString().slice(0, 800) || formData.title || 'lesson content';
                    const gen = await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'quiz',aiProvider:'openai',language:courseLanguage,level:courseLevel,topic:topicBase,quantity:quizQuantity})});
                    const g = await gen.json();
                    if (g?.data) {
                      setQuizPreview(g.preview || '');
                      const save = await fetch('/api/ai/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'quiz',data:g.data,lessonId,customName: quizName || `${formData.title || 'Lesson'} - Quiz`})});
                      const s = await save.json();
                      const quizzesRes = await fetch(`/api/lessons/${lessonId}/quizzes`);
                      const quizzesData = await quizzesRes.json().catch(()=>[]);
                      const lastQuiz = Array.isArray(quizzesData) ? quizzesData[quizzesData.length-1] : null;
                      if (lastQuiz?.id) await appendToFlow({ type: 'quiz', id: lastQuiz.id });
                      setLastMessage(`Quiz created with ${quizQuantity} questions.`);
                    }
                  }catch(e){ console.error(e); setLastMessage('Failed to generate/save quiz'); }
                  finally{ setAiBusy(false); }
                }}>
                  <Wand2 className="h-4 w-4 mr-2"/>Generate & Save Quiz
                </Button>
                {quizPreview && (
                  <div className="bg-gray-50 rounded-md p-3 max-h-72 overflow-auto">
                    <div className="text-sm font-medium mb-2">Preview</div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{quizPreview}</pre>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={()=>setCurrentStep(5)}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={()=>setCurrentStep(7)}>Next</Button>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                {aiBusy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                    <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                    <div className="text-sm text-yellow-800">
                      Creating... this might take some time! Grab a coffee and please wait for results and do not go to the next step!
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Quiz Name (optional)</Label>
                    <Input value={tfName} onChange={(e)=>setTfName(e.target.value)} className="mt-1" placeholder={`${formData.title || 'Lesson'} - True/False`} />
                  </div>
                  <div>
                    <Label>Statements</Label>
                    <Select value={tfQuantity.toString()} onValueChange={(v)=>setTfQuantity(parseInt(v))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[6,10,14].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button disabled={!lessonId || aiBusy} onClick={async()=>{
                  if (!lessonId) return; setAiBusy(true); setLastMessage(''); setTfPreview('');
                  try{
                    const lessonRes = await fetch(`/api/lessons/${lessonId}`);
                    const lessonData = await lessonRes.json();
                    const basis = (lessonData?.cultural_information || '').toString().slice(0, 1200) || formData.title || 'culture';
                    const gen = await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'true_false_quiz',aiProvider:'openai',language:courseLanguage,level:courseLevel,topic:basis,quantity:tfQuantity})});
                    const g = await gen.json();
                    if (g?.data) {
                      setTfPreview(g.preview || '');
                      const save = await fetch('/api/ai/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contentType:'true_false_quiz',data:g.data,lessonId,customName: tfName || `${formData.title || 'Lesson'} - True/False`})});
                      await save.json();
                      const quizzesRes = await fetch(`/api/lessons/${lessonId}/quizzes`);
                      const quizzesData = await quizzesRes.json().catch(()=>[]);
                      const lastQuiz = Array.isArray(quizzesData) ? quizzesData[quizzesData.length-1] : null;
                      if (lastQuiz?.id) await appendToFlow({ type: 'quiz', id: lastQuiz.id });
                      setLastMessage(`True/False quiz created with ${tfQuantity} statements.`);
                    }
                  }catch(e){ console.error(e); setLastMessage('Failed to generate/save true/false quiz'); }
                  finally{ setAiBusy(false); }
                }}>
                  <Wand2 className="h-4 w-4 mr-2"/>Generate & Save True/False Quiz
                </Button>
                {tfPreview && (
                  <div className="bg-gray-50 rounded-md p-3 max-h-72 overflow-auto">
                    <div className="text-sm font-medium mb-2">Preview</div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{tfPreview}</pre>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={()=>setCurrentStep(6)}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={()=>setCurrentStep(8)}>Next</Button>
                </div>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-4">
                {aiBusy && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-3">
                    <Loader2 className="h-4 w-4 text-yellow-600 mt-0.5 animate-spin" />
                    <div className="text-sm text-yellow-800">
                      Creating... this might take some time! Grab a coffee and please wait for results and do not go to the next step!
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Number of Gaps</Label>
                    <Select value={gfNumGaps.toString()} onValueChange={(v)=>setGfNumGaps(parseInt(v))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[6,8,10,12].map(n => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <Button disabled={!lessonId || aiBusy || !formData.content} onClick={async()=>{
                      if (!lessonId) return; setAiBusy(true); setLastMessage(''); setGfPreview('');
                      try{
                        const text = (formData.content || '').toString();
                        const words = Array.from(new Set(text
                          .replace(/[^A-Za-zÀ-ÿäöüÄÖÜß\s]/g,'')
                          .split(/\s+/)
                          .map(w=>w.trim())
                          .filter(w=>w.length>3 && !['the','and','der','die','das','und','les','des','que','para','with','that'].includes(w.toLowerCase()))));
                        const selected = words.sort(()=>Math.random()-0.5).slice(0, Math.min(gfNumGaps, words.length));
                        let updated = text;
                        const correctOrder: string[] = [];
                        selected.forEach((w)=>{
                          const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`,'i');
                          const m = updated.match(re);
                          if (m){
                            updated = updated.replace(re,'[BLANK]');
                            correctOrder.push(m[0]);
                          }
                        });
                        setGfPreview(updated);
                        const requestBody = {
                          title: `${formData.title || 'Lesson'} - Gap Fill`,
                          description: 'Auto-created gap fill from lesson content',
                          quiz_type: 'gap_fill',
                          pass_percentage: 70,
                          time_limit: 0,
                          max_attempts: 0,
                          points_value: 50,
                          is_published: true,
                          lesson_id: lessonId,
                          gf_original_text: text,
                          gf_text_content: updated,
                          gf_num_gaps: selected.length,
                          gf_word_bank: selected.join(', '),
                          gf_correct_order: correctOrder.join('|'),
                          gf_difficulty: 'medium',
                          gf_allow_hints: true,
                        };
                        const res = await fetch('/api/quizzes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(requestBody)});
                        if (res.ok){
                          const created = await res.json();
                          setLastMessage('Gap Fill quiz created.');
                          await appendToFlow({ type: 'quiz', id: created?.id });
                        } else { const err = await res.json().catch(()=>({})); setLastMessage(err?.error || 'Failed to create gap fill'); }
                      }catch(e){ console.error(e); setLastMessage('Failed to generate gap fill'); }
                      finally{ setAiBusy(false); }
                    }} className="w-full">
                      <Wand2 className="h-4 w-4 mr-2"/>Generate & Save Gap Fill
                    </Button>
                  </div>
                </div>
                {gfPreview && (
                  <div className="bg-gray-50 rounded-md p-3 max-h-72 overflow-auto">
                    <div className="text-sm font-medium mb-2">Preview</div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{gfPreview}</pre>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={()=>setCurrentStep(7)}>Back</Button>
                  <div className="text-sm text-gray-600">{lastMessage}</div>
                  <Button onClick={async()=>{ await finalizeFlowOrder(); router.push(`/dashboard/content/lessons/${lessonId}`); }}>Finish</Button>
                </div>
              </div>
            )}
            {/* Removed old steps 9 & 10 (Vocab Run, Hangman) — consolidated in Games step */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateLessonPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    }>
      <CreateLessonForm />
    </Suspense>
  );
} 