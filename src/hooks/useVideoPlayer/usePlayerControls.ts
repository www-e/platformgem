// src/hooks/useVideoPlayer/usePlayerControls.ts

import { RefObject, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Provides a memoized set of control functions for an HTMLVideoElement
 * by finding it within a container element.
 * @param containerRef - A React ref pointing to the container DIV element of the video.
 */
export function usePlayerControls(
  containerRef: RefObject<HTMLDivElement | null>
) {
  const togglePlay = useCallback(() => {
    const video = containerRef.current?.querySelector('video');
    if (!video) return;

    if (video.paused) {
      video.play().catch((err: Error) => {
        console.error('Play error:', err);
        toast.error('حدث خطأ في تشغيل الفيديو');
      });
    } else {
      video.pause();
    }
  }, [containerRef]);

  const handleSeek = useCallback(
    (value: number[]) => {
      const video = containerRef.current?.querySelector('video');
      if (!video || isNaN(video.duration)) return;
      video.currentTime = (value[0] / 100) * video.duration;
    },
    [containerRef]
  );

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      const video = containerRef.current?.querySelector('video');
      if (!video) return;
      video.volume = value[0] / 100;
      video.muted = value[0] === 0;
    },
    [containerRef]
  );

  const toggleMute = useCallback(() => {
    const video = containerRef.current?.querySelector('video');
    if (!video) return;
    video.muted = !video.muted;
  }, [containerRef]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err: Error) => {
        toast.error(`لا يمكن تفعيل وضع ملء الشاشة: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, [containerRef]);

  const changePlaybackRate = useCallback(
    (rate: number) => {
      const video = containerRef.current?.querySelector('video');
      if (!video) return;
      video.playbackRate = rate;
    },
    [containerRef]
  );

  const skipTime = useCallback(
    (seconds: number) => {
      const video = containerRef.current?.querySelector('video');
      if (!video) return;
      video.currentTime += seconds;
    },
    [containerRef]
  );

  return {
    togglePlay,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    changePlaybackRate,
    skipTime,
  };
}