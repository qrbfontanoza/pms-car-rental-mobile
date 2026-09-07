import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSessionService } from '../../core/auth-session.service';
import { ApiEnvelope } from '../../models/api.models';
import { CustomerProfile } from '../../models/domain.models';
import { ProfileService } from '../../models/service.interfaces';
import { mapProfile } from './api-mappers';

@Injectable()
export class ApiProfileService extends ProfileService {
  constructor(
    private readonly http: HttpClient,
    private readonly session: AuthSessionService,
  ) {
    super();
  }
  get(): Observable<CustomerProfile> {
    return this.http
      .get<ApiEnvelope<CustomerProfile>>(`${environment.apiBaseUrl}/profile`)
      .pipe(map((response) => mapProfile(response.data)));
  }
  update(patch: Partial<CustomerProfile>): Observable<CustomerProfile> {
    return this.http.patch<ApiEnvelope<CustomerProfile>>(`${environment.apiBaseUrl}/profile`, patch).pipe(
      map((response) => mapProfile(response.data)),
      tap((profile) => this.session.updateUser(profile)),
    );
  }
  updateNotifications(notifications: CustomerProfile['notifications']): Observable<CustomerProfile> {
    return this.http
      .patch<ApiEnvelope<CustomerProfile>>(`${environment.apiBaseUrl}/profile/notifications`, {
        notifications,
      })
      .pipe(
        map((response) => mapProfile(response.data)),
        tap((profile) => this.session.updateUser(profile)),
      );
  }
}
