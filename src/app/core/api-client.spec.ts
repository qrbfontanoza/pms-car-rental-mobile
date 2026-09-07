import { HttpErrorResponse } from '@angular/common/http';
import { ApiClientError, normalizeApiError } from './api-client';

describe('API error handling', () => {
  it('unwraps field errors and request IDs from the server envelope', () => {
    const result = normalizeApiError(
      new HttpErrorResponse({
        status: 422,
        error: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please correct the highlighted fields.',
            fieldErrors: { email: 'Enter a valid email.' },
            requestId: 'request-123',
          },
        },
      }),
    );
    expect(result).toEqual(jasmine.any(ApiClientError));
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.fieldErrors['email']).toBe('Enter a valid email.');
    expect(result.requestId).toBe('request-123');
  });

  it('returns a clear connection message for network failures', () => {
    const result = normalizeApiError(new HttpErrorResponse({ status: 0 }));
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).toContain('Check your connection');
  });
});
