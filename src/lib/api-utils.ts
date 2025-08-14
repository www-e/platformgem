// src/lib/api-utils.ts
// Backward compatibility layer - use api-response.ts for new code

export type { ApiResponse } from './api-response';
export {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  ApiErrors,
  API_ERROR_CODES,
  ERROR_MESSAGES,
  getErrorMessage
} from './api-response';