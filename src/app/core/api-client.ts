import { HttpErrorResponse } from '@angular/common/http';
import { OperatorFunction, catchError, map, throwError } from 'rxjs';
import { ApiEnvelope, ApiErrorEnvelope } from '../models/api.models';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors: Record<string, string> = {},
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function unwrapApi<T>(): OperatorFunction<ApiEnvelope<T>, T> {
  return (source) =>
    source.pipe(
      map((response) => response.data),
      catchError((error: unknown) => throwError(() => normalizeApiError(error))),
    );
}

export function normalizeApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) return error;
  if (error instanceof HttpErrorResponse) {
    const envelope = error.error as Partial<ApiErrorEnvelope> | undefined;
    const apiError = envelope?.error;
    if (apiError?.message) {
      return new ApiClientError(
        apiError.message,
        error.status,
        apiError.code || 'REQUEST_ERROR',
        apiError.fieldErrors || {},
        apiError.requestId,
      );
    }
    if (error.status === 0) {
      return new ApiClientError(
        'Unable to reach PMS Car Rental. Check your connection and try again.',
        0,
        'NETWORK_ERROR',
      );
    }
    return new ApiClientError('The request could not be completed.', error.status, 'REQUEST_ERROR');
  }
  return new ApiClientError(
    error instanceof Error ? error.message : 'Unexpected application error.',
    0,
    'CLIENT_ERROR',
  );
}
