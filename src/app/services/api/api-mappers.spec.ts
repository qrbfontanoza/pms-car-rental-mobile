import { mapBooking, mapProfile, mapVehicle } from './api-mappers';

describe('API DTO mappers', () => {
  it('maps legacy vehicle fields into the mobile domain model', () => {
    const vehicle = mapVehicle({
      id: 7,
      title: 'Toyota Vios',
      category: 'sedan',
      price_per_day: 2200,
      seats: 5,
      fuel: 'Gasoline',
      transmission: 'Automatic',
      units_total: 3,
      available_units: 2,
      thumbnail: 'https://example.test/vios.jpg',
    });
    expect(vehicle.name).toBe('Toyota Vios');
    expect(vehicle.category).toBe('Sedan');
    expect(vehicle.dailyRate).toBe(2200);
    expect(vehicle.availableUnits).toBe(2);
  });

  it('normalizes numeric booking values', () => {
    const booking = mapBooking({
      id: '4',
      reference: 'PMS-4',
      userId: '2',
      vehicleId: '7',
      vehicleName: 'Toyota Vios',
      vehicleImage: 'vios.jpg',
      pickupDate: '2099-01-01',
      returnDate: '2099-01-02',
      contactNumber: '09170000000',
      renterAge: 25,
      preview: { rentalDays: 1, dailyRate: 2200, subtotal: 2200, discount: 0, total: 2200 },
      status: 'pending',
      paymentStatus: 'pay_at_pickup',
      createdAt: '2098-12-01T00:00:00Z',
    });
    expect(booking.id).toBe('4');
    expect(booking.preview.total).toBe(2200);
  });

  it('supplies safe notification defaults for older profiles', () => {
    const profile = mapProfile({
      id: '2',
      fullName: 'Maria Santos',
      email: 'maria@example.test',
      licenseStatus: 'not_uploaded',
      phone: '',
      notifications: undefined!,
    });
    expect(profile.notifications.bookingUpdates).toBeTrue();
  });
});
