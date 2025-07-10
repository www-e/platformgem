// src/components/course/video-player.tsx
"use client";

import ReactPlayer from "react-player/lazy";

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        config={{
          file: {
            forceHLS: true,
          },
        }}
        // Optional security enhancements
        // onContextMenu={e => e.preventDefault()}
        // config={{ file: { attributes: { controlsList: 'nodownload' } } }}
      />
    </div>
  );
}