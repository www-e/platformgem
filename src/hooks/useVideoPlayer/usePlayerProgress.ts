// src/hooks/useVideoPlayer/usePlayerProgress.ts

import { useEffect, useRef } from 'react';

export interface ProgressData {
  watchedDuration: number;
  totalDuration: number;
  lastPosition: number;
  completed: boolean;
}

type ProgressUpdateHandler = (progress: ProgressData) => void;

/**
 * Hook to handle progress tracking for the video player.
 * It sends periodic updates and a final update on unmount.
 * @param playerState - The state object from usePlayerState.
 * @param onProgressUpdate - The callback function to send updates to the backend.
 */
export function usePlayerProgress(
  playerState: {
    currentTime: number;
    duration: number;
    watchedDuration: number;
    isPlaying: boolean;
  },
  onProgressUpdate?: ProgressUpdateHandler
) {
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { currentTime, duration, watchedDuration, isPlaying } = playerState;

  // Effect for periodic progress updates every 10 seconds while playing
  useEffect(() => {
    if (!isPlaying || !duration || !onProgressUpdate) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      const completed = currentTime >= duration * 0.9; // 90% completion threshold
      onProgressUpdate({
        watchedDuration: Math.round(watchedDuration),
        totalDuration: Math.round(duration),
        lastPosition: Math.round(currentTime),
        completed,
      });
    }, 10000); // Update every 10 seconds

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration, currentTime, watchedDuration, onProgressUpdate]);

  // Effect to save final progress on unmount
  useEffect(() => {
    return () => {
      // Only report if the video has loaded and there's a callback
      if (duration > 0 && onProgressUpdate) {
        console.log('Unmounting player, saving final progress...');
        const completed = currentTime >= duration * 0.9;
        onProgressUpdate({
          watchedDuration: Math.round(watchedDuration),
          totalDuration: Math.round(duration),
          lastPosition: Math.round(currentTime),
          completed,
        });
      }
    };
    // We only want this to run on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, onProgressUpdate]);
}