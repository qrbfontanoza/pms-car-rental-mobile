import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ApiClientError } from './api-client';
import { NetworkService } from './network.service';

export const networkInterceptor: HttpInterceptorFn = (request, next) => {
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (isMutation && !inject(NetworkService).online()) {
    return throwError(
      () => new ApiClientError('You are offline. Reconnect before making changes.', 0, 'OFFLINE_MUTATION'),
    );
  }
  return next(request);
};
