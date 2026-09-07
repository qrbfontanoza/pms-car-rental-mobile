import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.models';
import { Booking, BookingDraft, BookingPricePreview } from '../../models/domain.models';
import { BookingService } from '../../models/service.interfaces';
import { mapBooking } from './api-mappers';

const bookingBody = (draft: Partial<BookingDraft>) => ({
  vehicleId: draft.vehicleId,
  pickupDate: draft.pickupDate,
  returnDate: draft.returnDate,
  contactNumber: draft.contactNumber,
  renterAge: draft.renterAge,
  voucherCode: draft.voucherCode,
});

@Injectable()
export class ApiBookingService extends BookingService {
  private readonly subject = new BehaviorSubject<Booking[]>([]);
  readonly bookings$ = this.subject.asObservable();

  constructor(private readonly http: HttpClient) {
    super();
  }

  clear(): void {
    this.subject.next([]);
  }

  list(): Observable<Booking[]> {
    return this.http.get<ApiEnvelope<Booking[]>>(`${environment.apiBaseUrl}/bookings`).pipe(
      map((response) => response.data.map(mapBooking)),
      tap((bookings) => this.subject.next(bookings)),
    );
  }

  getById(id: string): Observable<Booking> {
    return this.http
      .get<ApiEnvelope<Booking>>(`${environment.apiBaseUrl}/bookings/${encodeURIComponent(id)}`)
      .pipe(
        map((response) => mapBooking(response.data)),
        tap((booking) => this.upsert(booking)),
      );
  }

  preview(
    draft: Pick<BookingDraft, 'vehicleId' | 'pickupDate' | 'returnDate' | 'voucherCode'>,
  ): Observable<BookingPricePreview> {
    return this.http
      .post<ApiEnvelope<BookingPricePreview>>(
        `${environment.apiBaseUrl}/bookings/preview`,
        bookingBody(draft),
      )
      .pipe(map((response) => response.data));
  }

  create(draft: BookingDraft): Observable<Booking> {
    const idempotencyKey = globalThis.crypto?.randomUUID?.() ?? `mobile-${Date.now()}-${Math.random()}`;
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    return this.http
      .post<ApiEnvelope<Booking>>(`${environment.apiBaseUrl}/bookings`, bookingBody(draft), { headers })
      .pipe(
        map((response) => mapBooking(response.data)),
        tap((booking) => this.upsert(booking)),
      );
  }

  cancel(id: string): Observable<Booking> {
    return this.action(id, 'cancel');
  }

  returnEarly(id: string): Observable<Booking> {
    return this.action(id, 'return-early');
  }

  private action(id: string, action: 'cancel' | 'return-early'): Observable<Booking> {
    return this.http
      .post<ApiEnvelope<Booking>>(
        `${environment.apiBaseUrl}/bookings/${encodeURIComponent(id)}/${action}`,
        {},
      )
      .pipe(
        map((response) => mapBooking(response.data)),
        tap((booking) => this.upsert(booking)),
      );
  }

  private upsert(booking: Booking): void {
    const current = this.subject.value;
    this.subject.next([booking, ...current.filter((item) => item.id !== booking.id)]);
  }
}
