// src/lib/api/index.ts
// Consolidated API utilities - single import point

// Response utilities
export * from '@/lib/api-response';

// API Authentication (different from Next.js middleware)
export * from './auth';

// Pagination
export * from './pagination';

// Query builders
export * from './query-builders';

// Validation
export * from './validation';

// Database utilities
export * from './database';

// Error handling
export { withErrorHandling, ApiError, createApiError } from '@/lib/middleware/error-handler';