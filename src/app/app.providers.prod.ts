import { Provider } from '@angular/core';
import {
  AuthService,
  BookingService,
  MediaService,
  ProfileService,
  ReceiptService,
  SupportService,
  VehicleService,
  VoucherService,
} from './models/service.interfaces';
import {
  ApiAuthService,
  ApiBookingService,
  ApiMediaService,
  ApiProfileService,
  ApiReceiptService,
  ApiSupportService,
  ApiVehicleService,
  ApiVoucherService,
} from './services/api-services';

export const APP_SERVICE_PROVIDERS: Provider[] = [
  { provide: AuthService, useClass: ApiAuthService },
  { provide: VehicleService, useClass: ApiVehicleService },
  { provide: VoucherService, useClass: ApiVoucherService },
  { provide: BookingService, useClass: ApiBookingService },
  { provide: ProfileService, useClass: ApiProfileService },
  { provide: SupportService, useClass: ApiSupportService },
  { provide: ReceiptService, useClass: ApiReceiptService },
  { provide: MediaService, useClass: ApiMediaService },
];
