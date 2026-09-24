import { HttpErrorResponse } from '@angular/common/http';

/// The API's GlobalExceptionHandlingMiddleware returns a consistent JSON shape
/// ({ status, title, detail, traceId }); ASP.NET's built-in model validation returns
/// a different shape ({ errors: { field: string[] } }). This pulls a human-readable
/// message out of either.
export function extractApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;

  const data: unknown = error.error;
  if (typeof data === 'string' && data) return data;

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    if (typeof obj['detail'] === 'string' && obj['detail']) return obj['detail'] as string;
    if (typeof obj['message'] === 'string' && obj['message']) return obj['message'] as string;

    if (obj['errors'] && typeof obj['errors'] === 'object') {
      for (const value of Object.values(obj['errors'] as Record<string, unknown>)) {
        if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      }
    }

    if (typeof obj['title'] === 'string' && obj['title']) return obj['title'] as string;
  }

  return error.status === 0 ? "Can't reach the API. Is it running?" : fallback;
}
