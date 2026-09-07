import { Observable } from 'rxjs';
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
} from './domain.models';
export abstract class AuthService {
  abstract readonly user$: Observable<User | null>;
  abstract readonly ready$: Observable<boolean>;
  abstract readonly isAuthenticated: boolean;
  abstract restore(): Observable<User | null>;
  abstract login(value: AuthCredentials): Observable<User>;
  abstract register(value: Registration): Observable<User>;
  abstract logout(): Observable<void>;
  abstract forgotPassword(email: string): Observable<void>;
  abstract verifyResetCode(email: string, code: string): Observable<boolean>;
  abstract resetPassword(email: string, code: string, password: string): Observable<void>;
  abstract changePassword(currentPassword: string, newPassword: string): Observable<void>;
}
export abstract class VehicleService {
  abstract list(
    filter?: Partial<VehicleFilter>,
    page?: number,
    pageSize?: number,
  ): Observable<PaginatedResponse<Vehicle>>;
  abstract getById(id: string): Observable<Vehicle>;
  abstract refresh(): Observable<void>;
}
export abstract class BookingService {
  abstract readonly bookings$: Observable<Booking[]>;
  abstract clear(): void;
  abstract list(): Observable<Booking[]>;
  abstract getById(id: string): Observable<Booking>;
  abstract preview(
    draft: Pick<BookingDraft, 'vehicleId' | 'pickupDate' | 'returnDate' | 'voucherCode'>,
  ): Observable<BookingPricePreview>;
  abstract create(draft: BookingDraft): Observable<Booking>;
  abstract cancel(id: string): Observable<Booking>;
  abstract returnEarly(id: string): Observable<Booking>;
}
export abstract class VoucherService {
  abstract list(): Observable<Voucher[]>;
  abstract apply(code: string, subtotal: number): Observable<{ voucher: Voucher; discount: number }>;
}
export abstract class ProfileService {
  abstract get(): Observable<CustomerProfile>;
  abstract update(patch: Partial<CustomerProfile>): Observable<CustomerProfile>;
  abstract updateNotifications(value: CustomerProfile['notifications']): Observable<CustomerProfile>;
}
export abstract class SupportService {
  abstract send(
    value: Omit<SupportMessage, 'id' | 'userId' | 'createdAt' | 'status'>,
  ): Observable<SupportMessage>;
}
export abstract class ReceiptService {
  abstract get(bookingId: string): Observable<Receipt>;
  abstract share(receipt: Receipt): Observable<void>;
  abstract save(receipt: Receipt): Observable<string>;
}
export abstract class MediaService {
  abstract pickImage(
    kind: 'profile' | 'license',
  ): Observable<{ name: string; previewUrl: string; file?: File } | null>;
  abstract uploadProfilePhoto(file: File): Observable<CustomerProfile>;
  abstract uploadProfileLicense(file: File): Observable<CustomerProfile>;
  abstract uploadLicense(bookingId: string, file: File): Observable<void>;
}
