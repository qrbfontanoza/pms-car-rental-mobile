import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, defer, finalize, from, map, of, switchMap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, ApiSessionDto, StoredAuthSession } from '../../models/api.models';
import { AuthCredentials, Registration, User } from '../../models/domain.models';
import { AuthService } from '../../models/service.interfaces';
import { AuthSessionService } from '../../core/auth-session.service';
import { unwrapApi } from '../../core/api-client';
import { mapUser } from './api-mappers';

@Injectable()
export class ApiAuthService extends AuthService {
  readonly user$ = this.session.user$.asObservable();
  readonly ready$ = this.session.ready$;

  constructor(
    private readonly http: HttpClient,
    private readonly session: AuthSessionService,
  ) {
    super();
  }

  get isAuthenticated(): boolean {
    return !!this.session.user$.value;
  }

  restore(): Observable<User | null> {
    return defer(() => from(this.session.load())).pipe(
      switchMap((stored) => {
        if (!stored) return of(null);
        return this.http.get<ApiEnvelope<{ user: User }>>(`${environment.apiBaseUrl}/auth/me`).pipe(
          unwrapApi(),
          map(({ user }) => mapUser(user)),
          switchMap((user) => from(this.session.set({ ...stored, user })).pipe(map(() => user))),
        );
      }),
      catchError(() => from(this.session.clear()).pipe(map(() => null))),
      finalize(() => this.session.markReady()),
    );
  }

  login(value: AuthCredentials): Observable<User> {
    return this.establish(
      this.http.post<ApiEnvelope<ApiSessionDto>>(`${environment.apiBaseUrl}/auth/login`, value),
    );
  }

  register(value: Registration): Observable<User> {
    return this.establish(
      this.http.post<ApiEnvelope<ApiSessionDto>>(`${environment.apiBaseUrl}/auth/register`, {
        fullName: value.fullName,
        email: value.email,
        password: value.password,
        privacyConsent: value.privacyConsent,
        deviceLabel: 'PMS mobile app',
      }),
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.session.refreshToken;
    return defer(() => {
      // Start revocation while the access token is still available to the interceptor,
      // but never make local sign-out depend on a slow or unavailable network.
      this.http
        .post<void>(`${environment.apiBaseUrl}/auth/logout`, { refreshToken })
        .pipe(
          timeout(5000),
          catchError(() => of(undefined)),
        )
        .subscribe();
      return from(this.session.clear());
    });
  }

  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<ApiEnvelope<null>>(`${environment.apiBaseUrl}/auth/password/forgot`, { email })
      .pipe(
        unwrapApi(),
        map(() => undefined),
      );
  }

  verifyResetCode(email: string, code: string): Observable<boolean> {
    return this.http
      .post<void>(`${environment.apiBaseUrl}/auth/password/reset/verify`, { email, code })
      .pipe(map(() => true));
  }

  resetPassword(email: string, code: string, password: string): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/password/reset`, {
      email,
      code,
      newPassword: password,
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/password/change`, {
      currentPassword,
      newPassword,
    });
  }

  private establish(request: Observable<ApiEnvelope<ApiSessionDto>>): Observable<User> {
    return request.pipe(
      unwrapApi(),
      map((value) => ({ ...value, user: mapUser(value.user) }) as StoredAuthSession),
      switchMap((value) => from(this.session.set(value)).pipe(map(() => value.user))),
    );
  }
}
