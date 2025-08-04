// src/lib/course-card-utils.ts

export function getImageSizes(viewMode: 'grid' | 'list'): string {
  if (viewMode === 'list') {
    return '192px';
  }
  return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw';
}

export function getCardClassName(viewMode: 'grid' | 'list'): string {
  const baseClasses = 'hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm';
  
  if (viewMode === 'list') {
    return baseClasses;
  }
  
  return `group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 ${baseClasses} overflow-hidden`;
}