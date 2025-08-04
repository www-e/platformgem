// src/lib/catalog-utils.ts

/**
 * Sort options for the catalog
 */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'title', label: 'الاسم' },
  { value: 'price_low', label: 'السعر: من الأقل للأعلى' },
  { value: 'price_high', label: 'السعر: من الأعلى للأقل' }
];

/**
 * Price range filter options
 */
export const PRICE_RANGE_OPTIONS = [
  { value: 'all', label: 'جميع الأسعار' },
  { value: 'free', label: 'مجاني' },
  { value: 'paid', label: 'مدفوع' }
];

/**
 * Generate pagination numbers for display
 */
export function generatePaginationNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): number[] {
  const pages: number[] = [];
  const half = Math.floor(maxVisible / 2);
  
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  // Adjust start if we're near the end
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
}