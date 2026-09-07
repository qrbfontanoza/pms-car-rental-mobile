import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.models';
import { SupportMessage } from '../../models/domain.models';
import { SupportService } from '../../models/service.interfaces';

@Injectable()
export class ApiSupportService extends SupportService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  send(value: Omit<SupportMessage, 'id' | 'userId' | 'createdAt' | 'status'>): Observable<SupportMessage> {
    return this.http
      .post<ApiEnvelope<SupportMessage>>(`${environment.apiBaseUrl}/messages`, value)
      .pipe(map((response) => response.data));
  }
}
