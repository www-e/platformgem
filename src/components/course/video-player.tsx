// src/components/course/video-player.tsx
"use client";

import ReactPlayer from "react-player/lazy";

interface VideoPlayerProps {
  url: string;
  onProgress?: (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number; }) => void;
}

export function VideoPlayer({ url, onProgress }: VideoPlayerProps) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-black">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        onProgress={onProgress} // Pass the progress handler down
        config={{
          file: {
            forceHLS: true,
          },
        }}
      />
    </div>
  );
}