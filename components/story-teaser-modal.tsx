'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, BookOpen, ArrowRight, Loader2, AlertCircle, RefreshCw, Volume2, Pause, Play, Square } from 'lucide-react';

type Language = 'spanish' | 'german' | 'french';

interface Story {
  id: number;
  title: string;
  content: string;
  audioUrl: string | null;
  lessonTitle: string;
  courseTitle: string;
  courseLanguage: string;
  totalStories: number;
  currentIndex: number;
}

interface StoryTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const languageLabels: Record<Language, string> = {
  spanish: 'Spanish',
  german: 'German',
  french: 'French',
};

const languageGradients: Record<Language, string> = {
  spanish: 'from-red-500 to-orange-500',
  german: 'from-gray-800 to-red-600',
  french: 'from-blue-500 to-red-500',
};

const languageEmoji: Record<Language, string> = {
  spanish: '🇪🇸',
  german: '🇩🇪',
  french: '🇫🇷',
};

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 1.0, label: '1×' },
  { value: 1.25, label: '1.25×' },
];

export function StoryTeaserModal({ isOpen, onClose, language }: StoryTeaserModalProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);

  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const resetAudioState = useCallback(() => {
    stopAudio();
    setAudioUrl(null);
    setAudioLoading(false);
    setAudioError(false);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current = null;
    }
  }, [stopAudio]);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
      }
    }, 250);
  }, []);

  const playAudio = useCallback((url: string) => {
    let audio = audioRef.current;
    if (!audio || audio.src !== url) {
      if (audio) audio.pause();
      audio = new Audio(url);
      audioRef.current = audio;
    }
    audio.playbackRate = playbackSpeed;

    audio.onplay = () => { setIsPlaying(true); setIsPaused(false); startProgressTracking(); };
    audio.onpause = () => { if (!audio!.ended) { setIsPlaying(false); setIsPaused(true); } };
    audio.onended = () => { setIsPlaying(false); setIsPaused(false); setProgress(0); if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
    audio.onerror = () => { setIsPlaying(false); setAudioError(true); };
    audio.onloadedmetadata = () => { setDuration(audio!.duration || 0); };

    audio.play().catch(() => { setIsPlaying(false); setAudioError(true); });
  }, [playbackSpeed, startProgressTracking]);

  const fetchAudioForLesson = useCallback(async (lessonId: number) => {
    setAudioLoading(true);
    setAudioError(false);
    try {
      const resp = await fetch(`/api/stories/teaser/audio?lessonId=${lessonId}`);
      if (!resp.ok) {
        setAudioError(true);
        return;
      }
      const data = await resp.json();
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
      } else {
        setAudioError(true);
      }
    } catch {
      setAudioError(true);
    } finally {
      setAudioLoading(false);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!story) return;

    if (isPlaying) {
      audioRef.current?.pause();
      return;
    }

    if (isPaused && audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(() => setAudioError(true));
      return;
    }

    if (audioUrl) {
      playAudio(audioUrl);
      return;
    }

    // No audio URL yet – fetch/generate it
    fetchAudioForLesson(story.id);
  }, [story, isPlaying, isPaused, audioUrl, playAudio, fetchAudioForLesson, playbackSpeed]);

  // Auto-play when audio URL becomes available after generation
  useEffect(() => {
    if (audioUrl && !audioLoading && !isPlaying && !isPaused) {
      playAudio(audioUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Update playback speed on the fly
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
    setProgress(audioRef.current.currentTime);
  }, [duration]);

  const fetchStory = useCallback(async (idx: number) => {
    setLoading(true);
    setError(null);
    setStory(null);
    resetAudioState();

    try {
      const response = await fetch(`/api/stories/teaser?language=${language}&index=${idx}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError(`No published ${languageLabels[language]} stories available yet. Check back soon!`);
        } else {
          setError('Could not load story. Please try again later.');
        }
        setLoading(false);
        return;
      }
      const data: Story = await response.json();
      setStory(data);

      // Use pre-cached audio URL if available
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      }
    } catch {
      setError('Could not load story. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [language, resetAudioState]);

  const handleNextStory = useCallback(() => {
    const totalStories = story?.totalStories || 3;
    const nextIndex = (storyIndex + 1) % totalStories;
    setStoryIndex(nextIndex);
    fetchStory(nextIndex);
  }, [storyIndex, story, fetchStory]);

  useEffect(() => {
    if (isOpen) {
      setStoryIndex(0);
      fetchStory(0);
      document.body.style.overflow = 'hidden';
    } else {
      resetAudioState();
    }
    return () => {
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderStoryContent = (content: string) => {
    const paragraphs = content
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(Boolean);

    return paragraphs.map((paragraph, idx) => {
      if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const text = paragraph.replace(/^#+\s*/, '');
        if (level <= 2) {
          return (
            <h3 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2">
              {text}
            </h3>
          );
        }
        return (
          <h4 key={idx} className="text-base font-semibold text-gray-800 mt-3 mb-1">
            {text}
          </h4>
        );
      }

      return (
        <p key={idx} className="text-gray-700 leading-relaxed mb-3 text-[1.05rem]">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${languageGradients[language]} px-6 py-4 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{languageEmoji[language]}</span>
            <div>
              <p className="text-white/80 text-sm font-medium">
                Story Preview{story ? ` (${story.currentIndex + 1}/${story.totalStories})` : ''}
              </p>
              <h2 className="text-white text-xl font-bold">
                {story ? story.title : `${languageLabels[language]} Short Story`}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading story...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">{error}</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && story && (
            <>
              {/* Audio Player */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    disabled={audioLoading}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      audioLoading
                        ? 'bg-gray-200 text-gray-400 cursor-wait'
                        : isPlaying
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    }`}
                  >
                    {audioLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Volume2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-500">
                        {audioLoading ? 'Generating audio...' : audioError ? 'Audio unavailable' : 'Listen to this story'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div
                      className="h-1.5 bg-gray-200 rounded-full cursor-pointer group"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-200 group-hover:h-2 group-hover:-mt-[1px]"
                        style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
                      />
                    </div>

                    {duration > 0 && (
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400">{formatTime(progress)}</span>
                        <span className="text-[10px] text-gray-400">{formatTime(duration)}</span>
                      </div>
                    )}
                  </div>

                  {/* Speed control */}
                  <div className="flex-shrink-0">
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="text-xs bg-white border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 cursor-pointer hover:border-gray-300"
                    >
                      {SPEED_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Stop button */}
                  {(isPlaying || isPaused) && (
                    <button
                      onClick={stopAudio}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
                    >
                      <Square className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Story metadata */}
              <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
                <BookOpen className="h-4 w-4" />
                <span>{story.courseTitle}</span>
                <span className="text-gray-300">·</span>
                <span>{story.lessonTitle}</span>
              </div>

              {/* Story content */}
              <div className="prose-like">
                {renderStoryContent(story.content)}
              </div>

              {/* Teaser CTA */}
              <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Want to learn with this story?</h4>
                    <p className="text-gray-600 text-sm">
                      Sign up for free to access all stories, audio narration, vocabulary practice, 
                      comprehension quizzes, and interactive games!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && story && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-gray-50">
            <button
              onClick={handleNextStory}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Another Story
            </button>
            <a
              href="/sign-up"
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold shadow-lg shadow-orange-500/25"
            >
              Sign Up for Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
