import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, from, map, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiEnvelope, ApiSessionDto } from '../models/api.models';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly http: HttpClient;
  private inFlight?: Observable<string>;

  constructor(
    backend: HttpBackend,
    private readonly session: AuthSessionService,
  ) {
    this.http = new HttpClient(backend);
  }

  refresh(): Observable<string> {
    if (this.inFlight) return this.inFlight;
    const refreshToken = this.session.refreshToken;
    if (!refreshToken) return throwError(() => new Error('No refresh session is available.'));
    this.inFlight = this.http
      .post<ApiEnvelope<ApiSessionDto>>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken })
      .pipe(
        map((response) => response.data),
        switchMap((nextSession) =>
          from(this.session.set(nextSession)).pipe(map(() => nextSession.accessToken)),
        ),
        catchError((error) =>
          from(this.session.clear()).pipe(switchMap(() => throwError(() => error as unknown))),
        ),
        finalize(() => (this.inFlight = undefined)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.inFlight;
  }
}
