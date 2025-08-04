// src/hooks/useVideoPlayer/useSecureVideoUrl.ts

import { useState, useEffect } from 'react';

/**
 * Hook to fetch the secure Bunny.net video URL.
 * @param lessonId - The ID of the lesson.
 * @param bunnyVideoId - The ID of the video on Bunny.net.
 * @returns An object containing the secure video URL, loading state, and any errors.
 */
export function useSecureVideoUrl(lessonId?: string, bunnyVideoId?: string) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have the necessary IDs
    if (!lessonId || !bunnyVideoId) {
      setIsLoading(false);
      return;
    }

    const fetchUrl = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/videos/${bunnyVideoId}/secure-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to get secure video URL'
          );
        }

        const data = await response.json();
        setVideoUrl(data.secureUrl);
      } catch (err) {
        console.error('Error fetching secure URL:', err);
        const message =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`فشل في تحميل الفيديو: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [lessonId, bunnyVideoId]);

  return { videoUrl, isLoading, error };
}