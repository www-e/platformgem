// src/components/video/player/PlayerControls.tsx

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { formatTime } from '@/lib/formatters';

interface PlayerControlsProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
    togglePlay: () => void;
    handleSeek: (value: number[]) => void;
    handleVolumeChange: (value: number[]) => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
    changePlaybackRate: (rate: number) => void;
    skipTime: (seconds: number) => void;
  }

/**
 * Renders the interactive control bar for the video player.
 */
export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  togglePlay,
  handleSeek,
  handleVolumeChange,
  toggleMute,
  toggleFullscreen,
  changePlaybackRate,
  skipTime,
}: PlayerControlsProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 bg-gradient-to-t from-black/60 to-transparent">
      {/* Progress Bar */}
      <div className="space-y-1">
        <Slider
          value={[progressPercent]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full h-2 group"
        />
        <div className="flex justify-between text-xs text-black/90 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" onClick={togglePlay} className="text-black">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => skipTime(-10)} className="text-black">
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => skipTime(10)} className="text-black">
            <RotateCw className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-black">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              className="w-24"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          <select
            value={playbackRate}
            onChange={(e) => changePlaybackRate(Number(e.target.value))}
            className="bg-transparent text-black text-sm rounded px-2 py-1 border-none outline-none hover:bg-white/20"
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-black">
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}