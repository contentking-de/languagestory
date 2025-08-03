'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  language?: string;
  voice?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioPlayer({ 
  text, 
  language, 
  voice, 
  className = '',
  size = 'md'
}: AudioPlayerProps) {
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
          voice
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert base64 to blob URL
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
        ], { type: 'audio/mp3' });
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Play the audio
        playAudio(url);
      } else {
        console.error('Failed to generate audio');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
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

  const handleClick = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      generateAudio();
    }
  };

  return (
    <div className={`inline-flex ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={`${buttonSize[size]} p-0 rounded-full hover:bg-gray-100 transition-colors`}
        title={`${isPlaying ? 'Stop' : 'Play'} pronunciation of "${text}"`}
      >
        {isLoading ? (
          <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        ) : isPlaying ? (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: '60%' }}></div>
                <div className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.1s' }}></div>
                <div className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <Volume2 className={`${sizeClasses[size]} text-gray-600 hover:text-blue-600`} />
        )}
      </Button>
    </div>
  );
} 