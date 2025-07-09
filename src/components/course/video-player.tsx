// src/components/course/video-player.tsx

"use client";

import ReactPlayer from "react-player/lazy";

interface VideoPlayerProps {
  // We pass the secure, signed URL directly to this component
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <div className="aspect-video w-full bg-slate-800 rounded-lg overflow-hidden shadow-2xl border border-white/10">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        controls={true}
        // This config is crucial for HLS streams (which Bunny.net uses)
        config={{
          file: {
            forceHLS: true,
          },
        }}
        // Further options to consider for security:
        // onContextMenu={e => e.preventDefault()} // Disables right-click menu
        // config={{ file: { attributes: { controlsList: 'nodownload' } } }} // Attempts to disable download button on some browsers
      />
    </div>
  );
}