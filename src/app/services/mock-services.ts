import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MOCK_BOOKINGS, MOCK_USER, MOCK_VEHICLES, MOCK_VOUCHERS } from '../data/mock-data';
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
import { StorageService } from '../core/storage.service';
import { rentalDays } from '../utils/app.utils';
const lag = <T>(value: T): Observable<T> => of(value).pipe(delay(environment.mockDelayMs));

@Injectable()
export class MockAuthService extends AuthService {
  private readonly key = 'pms.mock.session';
  private readonly subject: BehaviorSubject<User | null>;
  readonly user$: Observable<User | null>;
  readonly ready$ = of(true);
  constructor(private readonly storage: StorageService) {
    super();
    this.subject = new BehaviorSubject(this.storage.get<User | null>(this.key, null));
    this.user$ = this.subject.asObservable();
  }
  get isAuthenticated(): boolean {
    return !!this.subject.value;
  }
  restore(): Observable<User | null> {
    return lag(this.subject.value);
  }
  login(value: AuthCredentials): Observable<User> {
    if (value.password.length < 6)
      return throwError(() => new Error('Password must be at least 6 characters.'));
    const user = { ...MOCK_USER, email: value.email };
    this.persist(user);
    return lag(user);
  }
  register(value: Registration): Observable<User> {
    const user: User = {
      ...MOCK_USER,
      id: 'u-' + Date.now(),
      fullName: value.fullName,
      email: value.email,
      licenseStatus: value.licenseFileName ? 'pending' : 'not_uploaded',
    };
    this.persist(user);
    return lag(user);
  }
  logout(): Observable<void> {
    this.storage.remove(this.key);
    this.subject.next(null);
    return lag(undefined);
  }
  forgotPassword(_email: string): Observable<void> {
    return lag(undefined);
  }
  verifyResetCode(_email: string, code: string): Observable<boolean> {
    return lag(/^\d{6}$/.test(code));
  }
  resetPassword(_email: string, code: string, password: string): Observable<void> {
    return /^\d{6}$/.test(code) && password.length >= 6
      ? lag(undefined)
      : throwError(() => new Error('Invalid reset details.'));
  }
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return currentPassword.length >= 6 && newPassword.length >= 6
      ? lag(undefined)
      : throwError(() => new Error('Password must be at least 6 characters.'));
  }
  private persist(user: User): void {
    this.storage.set(this.key, user);
    this.subject.next(user);
  }
}

const defaultFilter: VehicleFilter = { keyword: '', categories: [], availableOnly: false, sort: 'newest' };
@Injectable()
export class MockVehicleService extends VehicleService {
  list(partial: Partial<VehicleFilter> = {}, page = 1, pageSize = 8): Observable<PaginatedResponse<Vehicle>> {
    const f = { ...defaultFilter, ...partial };
    let rows = MOCK_VEHICLES.filter(
      (v) =>
        (!f.keyword || `${v.name} ${v.category}`.toLowerCase().includes(f.keyword.toLowerCase())) &&
        (!f.categories.length || f.categories.includes(v.category)) &&
        (!f.minPrice || v.dailyRate >= f.minPrice) &&
        (!f.maxPrice || v.dailyRate <= f.maxPrice) &&
        (!f.seats || v.seats >= f.seats) &&
        (!f.fuel || v.fuel === f.fuel) &&
        (!f.transmission || v.transmission === f.transmission) &&
        (!f.availableOnly || v.availableUnits > 0),
    );
    const sorts: Record<VehicleFilter['sort'], (a: Vehicle, b: Vehicle) => number> = {
      name_asc: (a, b) => a.name.localeCompare(b.name),
      name_desc: (a, b) => b.name.localeCompare(a.name),
      price_asc: (a, b) => a.dailyRate - b.dailyRate,
      price_desc: (a, b) => b.dailyRate - a.dailyRate,
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    };
    rows = [...rows].sort(sorts[f.sort]);
    const start = (page - 1) * pageSize;
    return lag({
      data: rows.slice(start, start + pageSize),
      meta: { page, pageSize, total: rows.length, totalPages: Math.ceil(rows.length / pageSize) },
    });
  }
  getById(id: string): Observable<Vehicle> {
    const v = MOCK_VEHICLES.find((x) => x.id === id);
    return v ? lag(v) : throwError(() => new Error('Vehicle not found.'));
  }
  refresh(): Observable<void> {
    return lag(undefined);
  }
}
@Injectable()
export class MockVoucherService extends VoucherService {
  list(): Observable<Voucher[]> {
    return lag(MOCK_VOUCHERS);
  }
  apply(code: string, subtotal: number): Observable<{ voucher: Voucher; discount: number }> {
    const voucher = MOCK_VOUCHERS.find(
      (v) => v.code === code.toUpperCase() && v.active && Date.parse(v.expiresAt) > Date.now(),
    );
    if (!voucher) return throwError(() => new Error('Voucher is invalid or expired.'));
    const discount = Math.min(
      subtotal,
      voucher.type === 'percentage' ? subtotal * (voucher.value / 100) : voucher.value,
    );
    return lag({ voucher, discount });
  }
}
@Injectable()
export class MockBookingService extends BookingService {
  private readonly key = 'pms.mock.bookings';
  private readonly subject: BehaviorSubject<Booking[]>;
  readonly bookings$: Observable<Booking[]>;
  constructor(
    private readonly storage: StorageService,
    private readonly vouchers: VoucherService,
  ) {
    super();
    this.subject = new BehaviorSubject(this.storage.get(this.key, MOCK_BOOKINGS));
    this.bookings$ = this.subject.asObservable();
  }
  clear(): void {
    this.subject.next([]);
  }
  list(): Observable<Booking[]> {
    return lag(this.subject.value);
  }
  getById(id: string): Observable<Booking> {
    const booking = this.subject.value.find((item) => item.id === id);
    return booking ? lag(booking) : throwError(() => new Error('Booking not found.'));
  }
  preview(
    draft: Pick<BookingDraft, 'vehicleId' | 'pickupDate' | 'returnDate' | 'voucherCode'>,
  ): Observable<BookingPricePreview> {
    const v = MOCK_VEHICLES.find((x) => x.id === draft.vehicleId);
    if (!v) return throwError(() => new Error('Vehicle not found.'));
    const days = rentalDays(draft.pickupDate, draft.returnDate);
    if (days < 1) return throwError(() => new Error('Select a valid date range.'));
    const subtotal = days * v.dailyRate;
    if (!draft.voucherCode)
      return lag({ rentalDays: days, dailyRate: v.dailyRate, subtotal, discount: 0, total: subtotal });
    return this.vouchers.apply(draft.voucherCode, subtotal).pipe(
      map(({ voucher, discount }) => ({
        rentalDays: days,
        dailyRate: v.dailyRate,
        subtotal,
        discount,
        total: subtotal - discount,
        voucher,
      })),
    );
  }
  create(draft: BookingDraft): Observable<Booking> {
    const v = MOCK_VEHICLES.find((x) => x.id === draft.vehicleId);
    if (!v || v.availableUnits < 1)
      return throwError(() => new Error('This vehicle is currently unavailable.'));
    return this.preview(draft).pipe(
      map((preview) => {
        const booking: Booking = {
          id: 'b-' + Date.now(),
          reference:
            'PMS-' +
            new Date().toISOString().slice(2, 10).replace(/-/g, '') +
            '-' +
            Math.random().toString(36).slice(2, 6).toUpperCase(),
          userId: 'u-demo',
          vehicleId: v.id,
          vehicleName: v.name,
          vehicleImage: v.image,
          pickupDate: draft.pickupDate,
          returnDate: draft.returnDate,
          contactNumber: draft.contactNumber,
          renterAge: draft.renterAge,
          preview,
          status: 'pending',
          paymentStatus: 'pay_at_pickup',
          amountPaid: 0,
          createdAt: new Date().toISOString(),
        };
        this.update([booking, ...this.subject.value]);
        return booking;
      }),
    );
  }
  cancel(id: string): Observable<Booking> {
    return this.change(id, 'cancelled');
  }
  returnEarly(id: string): Observable<Booking> {
    return this.change(id, 'returned_early');
  }
  private change(id: string, status: Booking['status']): Observable<Booking> {
    const booking = this.subject.value.find((x) => x.id === id);
    if (!booking) return throwError(() => new Error('Booking not found.'));
    const updated = { ...booking, status };
    this.update(this.subject.value.map((x) => (x.id === id ? updated : x)));
    return lag(updated);
  }
  private update(value: Booking[]): void {
    this.storage.set(this.key, value);
    this.subject.next(value);
  }
}
@Injectable()
export class MockProfileService extends ProfileService {
  private readonly key = 'pms.mock.profile';
  constructor(private readonly storage: StorageService) {
    super();
  }
  get(): Observable<CustomerProfile> {
    return lag(this.storage.get(this.key, MOCK_USER));
  }
  update(patch: Partial<CustomerProfile>): Observable<CustomerProfile> {
    const value = { ...this.storage.get(this.key, MOCK_USER), ...patch };
    this.storage.set(this.key, value);
    return lag(value);
  }
  updateNotifications(notifications: CustomerProfile['notifications']): Observable<CustomerProfile> {
    return this.update({ notifications });
  }
}
@Injectable()
export class MockSupportService extends SupportService {
  constructor(private readonly storage: StorageService) {
    super();
  }
  send(value: Omit<SupportMessage, 'id' | 'userId' | 'createdAt' | 'status'>): Observable<SupportMessage> {
    const msg: SupportMessage = {
      ...value,
      id: 'm-' + Date.now(),
      userId: 'u-demo',
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    const all = this.storage.get<SupportMessage[]>('pms.mock.messages', []);
    this.storage.set('pms.mock.messages', [msg, ...all]);
    return lag(msg);
  }
}
@Injectable()
export class MockReceiptService extends ReceiptService {
  constructor(
    private readonly bookings: BookingService,
    private readonly profiles: ProfileService,
    private readonly vehicles: VehicleService,
  ) {
    super();
  }
  get(id: string): Observable<Receipt> {
    return this.bookings.list().pipe(
      map((list) => {
        const booking = list.find((x) => x.id === id);
        if (!booking) throw new Error('Receipt not found.');
        return booking;
      }),
      switchMap((booking) =>
        forkJoin({ customer: this.profiles.get(), vehicle: this.vehicles.getById(booking.vehicleId) }).pipe(
          map(({ customer, vehicle }) => ({
            booking,
            customer,
            vehicle,
            issuedAt: new Date().toISOString(),
          })),
        ),
      ),
    );
  }
  share(_receipt: Receipt): Observable<void> {
    return lag(undefined);
  }
  save(_receipt: Receipt): Observable<string> {
    return lag('Receipt downloaded.');
  }
}
@Injectable()
export class MockMediaService extends MediaService {
  pickImage(
    kind: 'profile' | 'license',
  ): Observable<{ name: string; previewUrl: string; file?: File } | null> {
    return lag({
      name: `mock-${kind}.jpg`,
      previewUrl: kind === 'profile' ? 'assets/profile-placeholder.svg' : 'assets/license-placeholder.svg',
    });
  }
  uploadProfilePhoto(_file: File): Observable<CustomerProfile> {
    return lag(MOCK_USER);
  }
  uploadProfileLicense(_file: File): Observable<CustomerProfile> {
    return lag({ ...MOCK_USER, licenseStatus: 'pending' });
  }
  uploadLicense(_bookingId: string, _file: File): Observable<void> {
    return lag(undefined);
  }
}
