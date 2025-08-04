// src/lib/course-content-utils.ts

export function formatDuration(seconds: number | null): string {
  if (!seconds) return 'غير محدد';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `0:${seconds.toString().padStart(2, '0')}`;
}

export function calculateProgressPercentage(
  lastPosition: number, 
  totalDuration: number | null
): number {
  if (!totalDuration || totalDuration === 0) return 0;
  return Math.round((lastPosition / totalDuration) * 100);
}