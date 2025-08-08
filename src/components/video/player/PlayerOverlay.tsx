// src/components/video/player/PlayerOverlay.tsx

import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause } from 'lucide-react';

interface PlayerOverlayProps {
  isLoading: boolean;
  isPlaying: boolean;
  togglePlay: () => void;
}

/**
 * Renders the central overlay for the video player, showing a loader or a play/pause button.
 */
export function PlayerOverlay({
  isLoading,
  isPlaying,
  togglePlay,
}: PlayerOverlayProps) {
  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Button
        variant="ghost"
        size="lg"
        onClick={togglePlay}
        className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 text-black transition-opacity group-hover:opacity-100 opacity-0 focus:opacity-100"
      >
        {isPlaying ? (
          <Pause className="w-10 h-10" />
        ) : (
          <Play className="w-10 h-10" />
        )}
      </Button>
    </div>
  );
}