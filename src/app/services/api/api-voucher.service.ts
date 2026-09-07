import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.models';
import { Voucher } from '../../models/domain.models';
import { VoucherService } from '../../models/service.interfaces';

@Injectable()
export class ApiVoucherService extends VoucherService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  list(): Observable<Voucher[]> {
    return this.http
      .get<ApiEnvelope<Voucher[]>>(`${environment.apiBaseUrl}/vouchers`)
      .pipe(map((response) => response.data));
  }
  apply(code: string, subtotal: number): Observable<{ voucher: Voucher; discount: number }> {
    return this.http
      .post<ApiEnvelope<{ voucher: Voucher; discount: number }>>(`${environment.apiBaseUrl}/vouchers/apply`, {
        code,
        subtotal,
      })
      .pipe(map((response) => response.data));
  }
}
