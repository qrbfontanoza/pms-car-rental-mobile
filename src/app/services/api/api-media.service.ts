import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSessionService } from '../../core/auth-session.service';
import { ApiEnvelope } from '../../models/api.models';
import { CustomerProfile } from '../../models/domain.models';
import { MediaService } from '../../models/service.interfaces';
import { mapProfile } from './api-mappers';

@Injectable()
export class ApiMediaService extends MediaService {
  constructor(
    private readonly http: HttpClient,
    private readonly session: AuthSessionService,
  ) {
    super();
  }

  pickImage(
    kind: 'profile' | 'license',
  ): Observable<{ name: string; previewUrl: string; file: File } | null> {
    return new Observable((subscriber) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png';
      input.setAttribute(
        'aria-label',
        kind === 'profile' ? 'Choose profile photo' : 'Choose driver license image',
      );
      input.addEventListener('change', () => {
        const file = input.files?.item(0);
        if (!file) {
          subscriber.next(null);
          subscriber.complete();
          return;
        }
        if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 3 * 1024 * 1024) {
          subscriber.error(new Error('Choose a JPEG or PNG image no larger than 3 MB.'));
          return;
        }
        subscriber.next({ name: file.name, previewUrl: URL.createObjectURL(file), file });
        subscriber.complete();
      });
      input.click();
    });
  }

  uploadProfilePhoto(file: File): Observable<CustomerProfile> {
    const body = new FormData();
    body.append('photo', file, file.name);
    return this.http.post<ApiEnvelope<CustomerProfile>>(`${environment.apiBaseUrl}/profile/photo`, body).pipe(
      map((response) => mapProfile(response.data)),
      tap((profile) => this.session.updateUser(profile)),
    );
  }

  uploadProfileLicense(file: File): Observable<CustomerProfile> {
    const body = new FormData();
    body.append('license', file, file.name);
    return this.http.post<ApiEnvelope<null>>(`${environment.apiBaseUrl}/profile/license`, body).pipe(
      switchMap(() => this.http.get<ApiEnvelope<CustomerProfile>>(`${environment.apiBaseUrl}/profile`)),
      map((response) => mapProfile(response.data)),
      tap((profile) => this.session.updateUser(profile)),
    );
  }

  uploadLicense(bookingId: string, file: File): Observable<void> {
    const body = new FormData();
    body.append('license', file, file.name);
    return this.http
      .post<ApiEnvelope<null>>(
        `${environment.apiBaseUrl}/bookings/${encodeURIComponent(bookingId)}/license`,
        body,
      )
      .pipe(map(() => undefined));
  }
}
