import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthCredentials,
  Booking,
  BookingDraft,
  BookingPricePreview,
  CustomerProfile,
  PaginatedResponse,
  Receipt,
  Registration,
  SupportMessage,
  User,
  Vehicle,
  VehicleFilter,
  Voucher,
} from '../models/domain.models';
import {
  AuthService,
  BookingService,
  MediaService,
  ProfileService,
  ReceiptService,
  SupportService,
  VehicleService,
  VoucherService,
} from '../models/service.interfaces';
const url = (path: string) => `${environment.apiBaseUrl}${path}`;
@Injectable()
export class ApiAuthService extends AuthService {
  private readonly subject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.subject.asObservable();
  get isAuthenticated(): boolean {
    return !!this.subject.value;
  }
  constructor(private readonly http: HttpClient) {
    super();
  }
  login(v: AuthCredentials) {
    return this.http.post<User>(url('/auth/login'), v);
  }
  register(v: Registration) {
    return this.http.post<User>(url('/auth/register'), v);
  }
  logout() {
    return this.http.post<void>(url('/auth/logout'), {});
  }
  forgotPassword(email: string) {
    return this.http.post<void>(url('/auth/password/forgot'), { email });
  }
  verifyResetCode(email: string, code: string) {
    return this.http.post<boolean>(url('/auth/password/reset/verify'), { email, code });
  }
  resetPassword(email: string, code: string, password: string) {
    return this.http.post<void>(url('/auth/password/reset'), { email, code, password });
  }
  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<void>(url('/auth/password/change'), { currentPassword, newPassword });
  }
}
@Injectable()
export class ApiVehicleService extends VehicleService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  list(filter: Partial<VehicleFilter> = {}, page = 1, pageSize = 8): Observable<PaginatedResponse<Vehicle>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined) params = params.set(k, Array.isArray(v) ? v.join(',') : String(v));
    });
    return this.http.get<PaginatedResponse<Vehicle>>(url('/vehicles'), { params });
  }
  getById(id: string) {
    return this.http.get<Vehicle>(url(`/vehicles/${id}`));
  }
  refresh() {
    return new Observable<void>((s) => {
      s.next();
      s.complete();
    });
  }
}
@Injectable()
export class ApiBookingService extends BookingService {
  private readonly subject = new BehaviorSubject<Booking[]>([]);
  readonly bookings$ = this.subject.asObservable();
  constructor(private readonly http: HttpClient) {
    super();
  }
  list() {
    return this.http.get<Booking[]>(url('/bookings'));
  }
  preview(draft: Pick<BookingDraft, 'vehicleId' | 'pickupDate' | 'returnDate' | 'voucherCode'>) {
    return this.http.post<BookingPricePreview>(url('/bookings/preview'), draft);
  }
  create(draft: BookingDraft) {
    return this.http.post<Booking>(url('/bookings'), draft);
  }
  cancel(id: string) {
    return this.http.post<Booking>(url(`/bookings/${id}/cancel`), {});
  }
  returnEarly(id: string) {
    return this.http.post<Booking>(url(`/bookings/${id}/return-early`), {});
  }
}
@Injectable()
export class ApiVoucherService extends VoucherService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  list() {
    return this.http.get<Voucher[]>(url('/vouchers'));
  }
  apply(code: string, subtotal: number) {
    return this.http.post<{ voucher: Voucher; discount: number }>(url('/vouchers/apply'), { code, subtotal });
  }
}
@Injectable()
export class ApiProfileService extends ProfileService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  get() {
    return this.http.get<CustomerProfile>(url('/auth/me'));
  }
  update(p: Partial<CustomerProfile>) {
    return this.http.patch<CustomerProfile>(url('/profile'), p);
  }
  updateNotifications(notifications: CustomerProfile['notifications']) {
    return this.http.patch<CustomerProfile>(url('/profile/notifications'), { notifications });
  }
}
@Injectable()
export class ApiSupportService extends SupportService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  send(v: Omit<SupportMessage, 'id' | 'userId' | 'createdAt' | 'status'>) {
    return this.http.post<SupportMessage>(url('/messages'), v);
  }
}
@Injectable()
export class ApiReceiptService extends ReceiptService {
  constructor(private readonly http: HttpClient) {
    super();
  }
  get(id: string) {
    return this.http.get<Receipt>(url(`/bookings/${id}/receipt`));
  }
  share(_r: Receipt) {
    return new Observable<void>((s) => {
      s.next();
      s.complete();
    });
  }
  save(_r: Receipt) {
    return new Observable<void>((s) => {
      s.next();
      s.complete();
    });
  }
}
@Injectable()
export class ApiMediaService extends MediaService {
  pickImage(_kind: 'profile' | 'license') {
    return new Observable<null>((s) => {
      s.next(null);
      s.complete();
    });
  }
}
