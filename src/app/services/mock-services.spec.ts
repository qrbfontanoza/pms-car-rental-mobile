import { firstValueFrom } from 'rxjs';
import { StorageService } from '../core/storage.service';
import { MockAuthService, MockBookingService, MockVehicleService, MockVoucherService } from './mock-services';
describe('mock service layer', () => {
  let storage: StorageService;
  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
  });
  it('filters available SUVs and sorts by price', async () => {
    const service = new MockVehicleService();
    const result = await firstValueFrom(
      service.list({ categories: ['SUV'], availableOnly: true, sort: 'price_asc' }, 1, 20),
    );
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((v) => v.category === 'SUV' && v.availableUnits > 0)).toBeTrue();
    expect(result.data[0].dailyRate).toBeLessThanOrEqual(result.data.at(-1)!.dailyRate);
  });
  it('persists only safe authentication state', async () => {
    const auth = new MockAuthService(storage);
    await firstValueFrom(auth.login({ email: 'test@example.com', password: 'secret1' }));
    expect(auth.isAuthenticated).toBeTrue();
    expect(localStorage.getItem('pms.mock.session')).not.toContain('secret1');
    await firstValueFrom(auth.logout());
    expect(auth.isAuthenticated).toBeFalse();
  });
  it('calculates percentage vouchers and booking totals', async () => {
    const bookings = new MockBookingService(storage, new MockVoucherService());
    const preview = await firstValueFrom(
      bookings.preview({
        vehicleId: '1',
        pickupDate: '2099-09-01',
        returnDate: '2099-09-02',
        voucherCode: 'BOOK50',
      }),
    );
    expect(preview.rentalDays).toBe(2);
    expect(preview.subtotal).toBe(4400);
    expect(preview.discount).toBe(2200);
    expect(preview.total).toBe(2200);
  });
  it('creates, cancels, and returns bookings immediately', async () => {
    const bookings = new MockBookingService(storage, new MockVoucherService());
    const created = await firstValueFrom(
      bookings.create({
        vehicleId: '1',
        pickupDate: '2099-10-01',
        returnDate: '2099-10-01',
        contactNumber: '09175550188',
        renterAge: 25,
      }),
    );
    expect(created.status).toBe('pending');
    expect((await firstValueFrom(bookings.cancel(created.id))).status).toBe('cancelled');
    const second = await firstValueFrom(
      bookings.create({
        vehicleId: '3',
        pickupDate: '2099-11-01',
        returnDate: '2099-11-02',
        contactNumber: '09175550188',
        renterAge: 25,
      }),
    );
    expect((await firstValueFrom(bookings.returnEarly(second.id))).status).toBe('returned_early');
  });
});
