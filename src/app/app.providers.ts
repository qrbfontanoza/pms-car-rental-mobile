import { Provider } from '@angular/core';
import { environment } from '../environments/environment';
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
import {
  MockAuthService,
  MockBookingService,
  MockMediaService,
  MockProfileService,
  MockReceiptService,
  MockSupportService,
  MockVehicleService,
  MockVoucherService,
} from './services/mock-services';
export const APP_SERVICE_PROVIDERS: Provider[] = [
  { provide: AuthService, useClass: environment.useMockApi ? MockAuthService : ApiAuthService },
  { provide: VehicleService, useClass: environment.useMockApi ? MockVehicleService : ApiVehicleService },
  { provide: VoucherService, useClass: environment.useMockApi ? MockVoucherService : ApiVoucherService },
  { provide: BookingService, useClass: environment.useMockApi ? MockBookingService : ApiBookingService },
  { provide: ProfileService, useClass: environment.useMockApi ? MockProfileService : ApiProfileService },
  { provide: SupportService, useClass: environment.useMockApi ? MockSupportService : ApiSupportService },
  { provide: ReceiptService, useClass: environment.useMockApi ? MockReceiptService : ApiReceiptService },
  { provide: MediaService, useClass: environment.useMockApi ? MockMediaService : ApiMediaService },
];
