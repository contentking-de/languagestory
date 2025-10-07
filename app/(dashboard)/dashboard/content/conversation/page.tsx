'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ConversationPage() {
  const [lessons, setLessons] = useState<Array<{ id: number; title: string; course_language?: string; course_title?: string }>>([]);
  const [lessonId, setLessonId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [thinking, setThinking] = useState(false);
  const autoListenRef = useRef<boolean>(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const lastAssistantRef = useRef<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/lessons');
        if (res.ok) {
          const data = await res.json();
          setLessons(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to load lessons', e);
      }
    })();
  }, []);

  const selectedLesson = useMemo(() => lessons.find(l => l.id.toString() === lessonId), [lessons, lessonId]);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [hasStarted, setHasStarted] = useState(false);
  const [lessonVocabulary, setLessonVocabulary] = useState<Array<{ term: string; english?: string; type?: string }>>([]);
  const [turns, setTurns] = useState<Array<{ user?: string; ai?: string; responseTimeMs?: number }>>([]);
  const lastQuestionTimeRef = useRef<number | null>(null);
  const [rating, setRating] = useState<any>(null);

  // Load lesson content on selection (for pre-read screen)
  useEffect(() => {
    const loadLesson = async () => {
      setHasStarted(false);
      setMessages([]);
      setLessonContent('');
      setLessonVocabulary([]);
      if (!lessonId) return;
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLessonContent(data?.content || '');
          // map vocabulary if available
          const vocab = Array.isArray(data?.vocabulary) ? data.vocabulary : [];
          const mapped = vocab.map((v: any) => {
            const term = (v?.word_german || v?.word_french || v?.word_spanish || v?.word_english || '').toString();
            return { term, english: v?.word_english, type: v?.word_type };
          }).filter((v: any) => v.term);
          setLessonVocabulary(mapped);
        }
      } catch (e) {
        console.error('Failed to load lesson content', e);
      }
    };
    loadLesson();
  }, [lessonId]);

  const startRecording = async () => {
    try {
      if (isPlayingTTS) return; // avoid recording while TTS is playing (echo)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      } as any);
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('audio', blob, 'audio.webm');
        try {
          const res = await fetch('/api/stt', { method: 'POST', body: fd });
          const data = await res.json();
          const raw = (data?.text || '').toString().trim();
          if (raw && raw.length > 1) {
            // prevent sending if transcription matches last assistant text (echo)
            if (lastAssistantRef.current && raw.replace(/\s+/g,' ').toLowerCase() === lastAssistantRef.current.replace(/\s+/g,' ').toLowerCase()) {
              // ignore echo
            } else {
              await handleHandsFreeSend(raw);
            }
          }
        } catch (e) {
          console.error('STT failed', e);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setTimeout(() => {
        if (mr.state !== 'inactive') mr.stop();
      }, 3000);
    } catch (e) {
      console.error('Mic error', e);
      alert('Microphone access failed. Please check permissions.');
    }
  };

  async function playReplyTTS(text: string) {
    try {
      setIsPlayingTTS(true);
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'english', type: 'conversation' }),
      });
      const ttsData = await ttsRes.json();
      const base64 = ttsData?.audio_base64;
      const url = ttsData?.audio_url;
      await new Promise<void>((resolve) => {
        const audio = new Audio(base64 ? `data:audio/mp3;base64,${base64}` : url);
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    } finally {
      setIsPlayingTTS(false);
    }
  }

  const handleHandsFreeSend = async (text: string) => {
    if (!lessonId) return;
    const content = (text || '').trim();
    if (!content) return;
    const responseTimeMs = lastQuestionTimeRef.current ? Date.now() - lastQuestionTimeRef.current : undefined;
    const newMessages = [...messages, { role: 'user', content } as ChatMessage];
    setMessages(newMessages);
    setTurns(prev => [...prev, { user: content, responseTimeMs }]);
    setThinking(true);
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: parseInt(lessonId), messages: newMessages }),
      });
      const data = await res.json();
      if (data?.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        setTurns(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last) last.ai = data.reply;
          return updated;
        });
        // Play TTS with low latency when possible
        try {
          lastAssistantRef.current = data.reply;
          await playReplyTTS(data.reply);
        } catch (e) {
          console.warn('TTS playback failed', e);
        }
        lastQuestionTimeRef.current = Date.now();
      }
    } catch (e) {
      console.error('Conversation error', e);
    } finally {
      setThinking(false);
      // restart listening loop after short delay
      if (autoListenRef.current) {
        setTimeout(() => {
          startRecording().catch(() => {});
        }, 200);
      }
    }
  };

  // removed manual stop and send (hands-free)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-indigo-600" />
          Conversation
        </h1>
        <p className="text-gray-600 mt-1">Select a lesson, read the content, then start the conversation.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Select Lesson</label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map(l => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{!hasStarted ? 'Lesson Content' : 'Conversation'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!lessonId && (
            <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 p-3 rounded">
              Please select a lesson first so the conversation stays on topic.
            </div>
          )}

          {!hasStarted ? (
            <>
              <div className="space-y-2 max-h-[48rem] overflow-y-auto border rounded p-3 bg-white">
                {lessonContent ? (
                  <div className="whitespace-pre-wrap text-sm text-gray-800">{lessonContent}</div>
                ) : (
                  <div className="text-sm text-gray-500">Select a lesson to view its content.</div>
                )}
                {lessonVocabulary.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Vocabulary (from this lesson)</div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-800">
                      {lessonVocabulary.slice(0, 24).map((w, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="inline-block rounded bg-gray-100 px-2 py-0.5">{w.term}</span>
                          {w.english && <span className="text-gray-500">({w.english})</span>}
                          {w.type && <span className="text-xs text-gray-500 ml-auto">{w.type}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">Please read the lesson content carefully before starting.</div>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                disabled={!lessonId}
                onClick={async () => {
                  setHasStarted(true);
                  setThinking(true);
                  try {
                    const res = await fetch('/api/conversation', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ lessonId: parseInt(lessonId), messages: [], start: true }),
                    });
                    const data = await res.json();
                    if (data?.reply) {
                      setMessages([{ role: 'assistant', content: data.reply }]);
                      // Play welcome prompt via TTS
                      try {
                        lastAssistantRef.current = data.reply;
                        await playReplyTTS(data.reply);
                      } catch (_) {}
                    }
                  } finally {
                    setThinking(false);
                    // now wait for user confirmation; enable one-shot listening
                    autoListenRef.current = true;
                    startRecording().catch(() => {});
                  }
                }}
              >
                Let's start a conversation
              </button>
            </>
          ) : (
            <>
              {lessonVocabulary.length > 0 && (
                <div className="text-xs text-gray-600">
                  Using lesson vocabulary to guide the conversation. Examples: {lessonVocabulary.slice(0, 6).map(v => v.term).join(', ')}{lessonVocabulary.length > 6 ? '…' : ''}
                </div>
              )}
              <div className="space-y-3 max-h-[48rem] overflow-y-auto border rounded p-3 bg-white">
                {messages.map((m, idx) => (
                  <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    <div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {thinking && <div className="text-sm text-gray-500">AI is thinking…</div>}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Hands-free mode: Speak your answer after the AI finishes.</div>
                <button
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => {
                    // stop conversation: mic + audio + flags
                    autoListenRef.current = false;
                    const mr = mediaRecorderRef.current;
                    if (mr && mr.state !== 'inactive') {
                      try { mr.stop(); } catch {}
                    }
                    // stop tracks if any
                    try {
                      const navAny = navigator as any;
                      (navAny.mediaDevices?.getUserMedia && (navAny._activeStream?.getTracks?.().forEach((t: any) => t.stop())));
                    } catch {}
                    setIsPlayingTTS(false);
                    setThinking(false);
                    // Request rating
                    (async () => {
                      try {
                        const res = await fetch('/api/conversation/rate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            language: 'english',
                            level: 'intermediate',
                            topic: (selectedLesson?.title || 'Lesson'),
                            turns,
                            lessonVocabulary
                          })
                        });
                        const data = await res.json();
                        setRating(data);
                      } catch (e) {
                        console.error('Rating failed', e);
                        setRating(null);
                      }
                    })();
                  }}
                >
                  Stop conversation
                </button>
              </div>
              {rating && (
                <div className="mt-4 border rounded p-4 md:p-5 bg-white">
                  <div className="text-base font-semibold mb-2">Conversation Rating</div>
                  <div className="text-base text-gray-900">
                    Overall: {rating?.scores?.overall ?? '—'} / 100
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-800 mt-3">
                    <div>Quality: {rating?.scores?.quality ?? '—'}</div>
                    <div>Vocabulary: {rating?.scores?.vocabulary ?? '—'}</div>
                    <div>Fluency: {rating?.scores?.fluency ?? '—'}</div>
                    <div>Response time: {rating?.scores?.response_time ?? '—'}</div>
                  </div>
                  <div className="mt-3 text-base text-gray-900">{rating?.feedback?.summary}</div>
                  {Array.isArray(rating?.feedback?.strengths) && rating.feedback.strengths.length > 0 && (
                    <div className="mt-3 text-sm">
                      <div className="font-semibold mb-1">Strengths</div>
                      <ul className="list-disc pl-6 space-y-1">
                        {rating.feedback.strengths.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(rating?.feedback?.improvements) && rating.feedback.improvements.length > 0 && (
                    <div className="mt-3 text-sm">
                      <div className="font-semibold mb-1">Improvements</div>
                      <ul className="list-disc pl-6 space-y-1">
                        {rating.feedback.improvements.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


