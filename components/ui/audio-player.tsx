'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2, Square } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  language?: string;
  voice?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  vocabularyId?: number;
  lessonId?: number;
  type?: 'cultural';
}

export function AudioPlayer({ 
  text, 
  language, 
  voice, 
  className = '',
  size = 'md',
  vocabularyId,
  lessonId,
  type
}: AudioPlayerProps) {
  // Version check to ensure we're using the latest code
  console.log('AudioPlayer v2.1 loaded', { text, vocabularyId, lessonId, type });
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const buttonSize = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const generateAudio = async () => {
    if (audioUrl) {
      // If we already have audio, just play it
      playAudio();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
          voice,
          vocabularyId,
          lessonId,
          type
        }),
      });

      if (response.ok) {
        let data;
        try {
          data = await response.json();
          console.log('TTS API response:', data); // Debug log
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          const responseText = await response.text();
          console.error('Raw response:', responseText);
          return;
        }
        
        // Validate response structure
        if (!data.audio_url) {
          console.error('Invalid response: missing audio_url', data);
          return;
        }
        
        if (data.cached) {
          // Audio was cached, use the URL directly
          setAudioUrl(data.audio_url);
          playAudio(data.audio_url);
        } else {
          // New audio generated, use the URL directly
          setAudioUrl(data.audio_url);
          playAudio(data.audio_url);
        }
      } else {
        console.error('Failed to generate audio');
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (url?: string) => {
    const audioToPlay = url || audioUrl;
    if (!audioToPlay) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioToPlay);
    audioRef.current = audio;
    
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', () => {
      setIsPlaying(false);
      setIsLoading(false);
    });

    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setIsLoading(false);
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className={`inline-flex gap-1 ${className}`}>
      {isPlaying ? (
        <>
          {/* Stop Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={stopAudio}
            className={`${buttonSize[size]} p-0 rounded-full hover:bg-red-100 transition-colors`}
            title={`Stop pronunciation of "${text}"`}
          >
            <Square className={`${sizeClasses[size]} text-red-600 hover:text-red-700`} />
          </Button>
        </>
      ) : (
        /* Play Button */
        <Button
          variant="ghost"
          size="sm"
          onClick={generateAudio}
          disabled={isLoading}
          className={`${buttonSize[size]} p-0 rounded-full hover:bg-gray-100 transition-colors`}
          title={`Play pronunciation of "${text}"`}
        >
          {isLoading ? (
            <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
          ) : (
            <Volume2 className={`${sizeClasses[size]} text-gray-600 hover:text-blue-600`} />
          )}
        </Button>
      )}
    </div>
  );
} 