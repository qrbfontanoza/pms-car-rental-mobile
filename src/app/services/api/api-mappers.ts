import { VehicleDto } from '../../models/api.models';
import { Booking, CustomerProfile, User, Vehicle, VehicleCategory } from '../../models/domain.models';

const category = (value: string): VehicleCategory => {
  const values: Record<string, VehicleCategory> = {
    sedan: 'Sedan',
    suv: 'SUV',
    van: 'Van',
    minivan: 'Minivan',
    scooter: 'Scooter',
    pickup: 'Pickup',
  };
  return values[value.trim().toLowerCase()] ?? 'Sedan';
};

export function mapUser(value: Partial<User> & { id: string | number; name?: string }): User {
  return {
    id: String(value.id),
    fullName: value.fullName ?? value.name ?? '',
    email: value.email ?? '',
    profileImage: value.profileImage,
    licenseStatus: value.licenseStatus ?? 'not_uploaded',
  };
}

export function mapVehicle(value: VehicleDto): Vehicle {
  const image = value.imageUrl ?? value.thumbnail ?? 'assets/vehicle-placeholder.svg';
  return {
    id: String(value.id),
    name: value.name ?? value.title ?? 'Vehicle',
    category: category(value.category),
    seats: Number(value.seats),
    fuel: (value.fuelType ?? value.fuel ?? 'Gasoline') as Vehicle['fuel'],
    transmission: value.transmission as Vehicle['transmission'],
    dailyRate: Number(value.dailyRate ?? value.price_per_day ?? 0),
    totalUnits: Number(value.totalUnits ?? value.units_total ?? 0),
    availableUnits: Number(value.availableUnits ?? value.available_units ?? 0),
    image,
    gallery: value.gallery?.length ? value.gallery : [image],
    description: value.description ?? '',
    createdAt: value.createdAt ?? value.created_at ?? new Date(0).toISOString(),
    featured: value.featured,
  };
}

export function mapBooking(value: Booking): Booking {
  return {
    ...value,
    id: String(value.id),
    userId: String(value.userId),
    vehicleId: String(value.vehicleId),
    preview: {
      ...value.preview,
      rentalDays: Number(value.preview.rentalDays),
      dailyRate: Number(value.preview.dailyRate),
      subtotal: Number(value.preview.subtotal),
      discount: Number(value.preview.discount),
      total: Number(value.preview.total),
    },
  };
}

export function mapProfile(value: CustomerProfile): CustomerProfile {
  return {
    ...mapUser(value),
    phone: value.phone ?? '',
    notifications: value.notifications ?? { bookingUpdates: true, promotions: false, reminders: true },
  };
}
