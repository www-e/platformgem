// src/components/video/BunnyVideoPlayer.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  RotateCcw,
  RotateCw,
  Loader2
} from 'lucide-react';
import { getSignedBunnyUrl } from '@/lib/bunny';
import { toast } from 'sonner';

interface BunnyVideoPlayerProps {
  lessonId: string;
  bunnyVideoId: string;
  bunnyLibraryId: string;
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

export function BunnyVideoPlayer({
  lessonId,
  bunnyVideoId,
  bunnyLibraryId,
  title,
  onProgressUpdate,
  onLessonComplete,
  initialPosition = 0,
  className = ""
}: BunnyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [watchedDuration, setWatchedDuration] = useState(0);

  // State for secure video URL
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Fetch secure video URL
  useEffect(() => {
    const fetchSecureUrl = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/videos/${bunnyVideoId}/secure-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId }),
        });

        if (!response.ok) {
          throw new Error('Failed to get secure video URL');
        }

        const data = await response.json();
        setVideoUrl(data.secureUrl);
      } catch (error) {
        console.error('Error fetching secure URL:', error);
        setError('فشل في تحميل الفيديو الآمن');
        setIsLoading(false);
      }
    };

    if (lessonId && bunnyVideoId) {
      fetchSecureUrl();
    }
  }, [lessonId, bunnyVideoId]);

  // Initialize video and load viewing history
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      
      // Set initial position if provided
      if (initialPosition > 0 && initialPosition < video.duration) {
        video.currentTime = initialPosition;
        setCurrentTime(initialPosition);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Update watched duration (only count forward progress)
      if (video.currentTime > lastUpdateTimeRef.current) {
        const additionalTime = video.currentTime - lastUpdateTimeRef.current;
        setWatchedDuration(prev => prev + additionalTime);
      }
      lastUpdateTimeRef.current = video.currentTime;
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onLessonComplete?.();
    };

    const handleError = () => {
      setError('حدث خطأ في تحميل الفيديو');
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [initialPosition, onLessonComplete, videoUrl]);

  // Progress tracking and API updates
  useEffect(() => {
    if (!duration || !onProgressUpdate) return;

    // Update progress every 10 seconds
    progressIntervalRef.current = setInterval(() => {
      const completed = currentTime >= duration * 0.9; // 90% completion threshold
      
      onProgressUpdate({
        watchedDuration: Math.round(watchedDuration),
        totalDuration: Math.round(duration),
        lastPosition: Math.round(currentTime),
        completed
      });
    }, 10000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [duration, currentTime, watchedDuration, onProgressUpdate]);

  // Save progress when component unmounts
  useEffect(() => {
    return () => {
      if (duration && onProgressUpdate) {
        const completed = currentTime >= duration * 0.9;
        onProgressUpdate({
          watchedDuration: Math.round(watchedDuration),
          totalDuration: Math.round(duration),
          lastPosition: Math.round(currentTime),
          completed
        });
      }
    };
  }, [duration, currentTime, watchedDuration, onProgressUpdate]);

  // Control functions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Play error:', err);
        toast.error('حدث خطأ في تشغيل الفيديو');
      });
    }
  }, [isPlaying]);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const skipTime = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentTime, duration]);

  // Format time display
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const videoContainer = videoRef.current?.parentElement;
    if (videoContainer) {
      videoContainer.addEventListener('mousemove', handleMouseMove);
      videoContainer.addEventListener('mouseleave', () => {
        if (isPlaying) setShowControls(false);
      });
    }

    return () => {
      clearTimeout(timeout);
      if (videoContainer) {
        videoContainer.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="aspect-video flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="text-red-400 mb-2">⚠️</div>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative group">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            preload="metadata"
            playsInline
            onClick={togglePlay}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}

          {/* Controls Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            
            {/* Play/Pause Button (Center) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 mr-1" />
                )}
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/80">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>

                  {/* Skip Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-xs ml-1">10</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipTime(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span className="text-xs ml-1">10</span>
                  </Button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Playback Speed */}
                  <select
                    value={playbackRate}
                    onChange={(e) => changePlaybackRate(Number(e.target.value))}
                    className="bg-black/50 text-white text-sm rounded px-2 py-1 border-none outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 border-t">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>المدة: {formatTime(duration)}</span>
            <span>تم المشاهدة: {formatTime(watchedDuration)}</span>
            <span>التقدم: {duration ? Math.round((currentTime / duration) * 100) : 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}