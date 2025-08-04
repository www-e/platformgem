// src/components/video/player/PlayerInfo.tsx

import { formatTime } from '@/lib/formatters'; // Assuming formatTime is moved to a shared util

interface PlayerInfoProps {
  title: string;
  duration: number;
  watchedDuration: number;
  currentTime: number;
}

/**
 * Renders the informational bar below the video player.
 */
export function PlayerInfo({
  title,
  duration,
  watchedDuration,
  currentTime,
}: PlayerInfoProps) {
  return (
    <div className="p-4 border-t">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>المدة: {formatTime(duration)}</span>
        <span>تم المشاهدة: {formatTime(watchedDuration)}</span>
        <span>
          التقدم: {duration ? Math.round((currentTime / duration) * 100) : 0}%
        </span>
      </div>
    </div>
  );
}