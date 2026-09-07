import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSessionService } from './auth-session.service';
import { TokenRefreshService } from './token-refresh.service';

const AUTH_RETRIED = new HttpContextToken<boolean>(() => false);
const REFRESH_EXCLUSIONS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/password/forgot',
  '/auth/password/reset',
];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (environment.useMockApi || !request.url.startsWith(environment.apiBaseUrl)) {
    return next(request);
  }
  const session = inject(AuthSessionService);
  const refresher = inject(TokenRefreshService);
  const router = inject(Router);
  const token = session.accessToken;
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
    : request.clone({ setHeaders: { Accept: 'application/json' } });

  return next(authorized).pipe(
    timeout(20_000),
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const excluded = REFRESH_EXCLUSIONS.some((path) => request.url.includes(path));
      if (!isUnauthorized || excluded || request.context.get(AUTH_RETRIED) || !session.refreshToken) {
        return throwError(() => error);
      }
      return refresher.refresh().pipe(
        switchMap((accessToken) =>
          next(
            request.clone({
              context: request.context.set(AUTH_RETRIED, true),
              setHeaders: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
            }),
          ),
        ),
        catchError((refreshError: unknown) => {
          const destination = router.url.startsWith('/auth/login') ? '/tabs/home' : router.url;
          return from(
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: destination },
              replaceUrl: true,
            }),
          ).pipe(switchMap(() => throwError(() => refreshError)));
        }),
      );
    }),
  );
};
