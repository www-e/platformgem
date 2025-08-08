// src/components/video/BunnyVideoPlayer.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSecureVideoUrl } from '@/hooks/useVideoPlayer/useSecureVideoUrl';
import { usePlayerState } from '@/hooks/useVideoPlayer/usePlayerState';
import { usePlayerControls } from '@/hooks/useVideoPlayer/usePlayerControls';
import { usePlayerProgress } from '@/hooks/useVideoPlayer/usePlayerProgress';
import { PlayerOverlay } from './player/PlayerOverlay';
import { PlayerControls } from './player/PlayerControls';
import { PlayerInfo } from './player/PlayerInfo';

interface BunnyVideoPlayerProps {
  lessonId: string;
  bunnyVideoId: string;
  bunnyLibraryId: string; // Keep for context, though unused in the new structure
  title: string;
  onProgressUpdate?: (progress: {
    watchedDuration: number;
    totalDuration: number;
    lastPosition: number;
    completed: boolean;
  }) => void;
  onLessonComplete?: () => void;
  initialPosition?: number;
  className?: string;
}

/**
 * A modular and robust video player for Bunny.net content.
 * This container component orchestrates data fetching, state management,
 * and UI rendering by composing custom hooks and presentational components.
 */
export function BunnyVideoPlayer({
  lessonId,
  bunnyVideoId,
  title,
  onProgressUpdate,
  onLessonComplete,
  initialPosition = 0,
  className = '',
}: BunnyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);

  const {
    videoUrl,
    isLoading: isUrlLoading,
    error: urlError,
  } = useSecureVideoUrl(lessonId, bunnyVideoId);

  const playerState = usePlayerState(videoRef, onLessonComplete, initialPosition);
  const playerControls = usePlayerControls(playerContainerRef);

  // Initialize progress tracking
  usePlayerProgress(playerState, onProgressUpdate);

  // Auto-hide controls logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const container = playerContainerRef.current;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (playerState.isPlaying) setShowControls(false);
      }, 3000);
    };

    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        if (playerState.isPlaying) setShowControls(false);
      });
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [playerState.isPlaying]);

  const error = urlError || playerState.error;

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="aspect-video flex items-center justify-center bg-black text-black">
          <div className="text-center">
            <p className="text-xl mb-2">⚠️</p>
            <p className="font-semibold">حدث خطأ</p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div
          ref={playerContainerRef}
          className="relative aspect-video bg-black rounded-lg overflow-hidden group"
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            preload="metadata"
            playsInline
            onClick={playerControls.togglePlay}
          />

          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              showControls || !playerState.isPlaying
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          >
            <PlayerOverlay
              isLoading={isUrlLoading || playerState.isLoading}
              isPlaying={playerState.isPlaying}
              togglePlay={playerControls.togglePlay}
            />
            <PlayerControls {...playerState} {...playerControls} />
          </div>
        </div>

        <PlayerInfo
          title={title}
          duration={playerState.duration}
          watchedDuration={playerState.watchedDuration}
          currentTime={playerState.currentTime}
        />
      </CardContent>
    </Card>
  );
}