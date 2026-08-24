export type ThemePreference = 'system' | 'light' | 'dark';
export type VehicleCategory = 'Sedan' | 'SUV' | 'Van' | 'Minivan' | 'Scooter' | 'Pickup';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'returned_early';
export interface User {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  licenseStatus: 'not_uploaded' | 'pending' | 'verified';
}
export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  seats: number;
  fuel: 'Gasoline' | 'Diesel' | 'Hybrid';
  transmission: 'Automatic' | 'Manual';
  dailyRate: number;
  totalUnits: number;
  availableUnits: number;
  image: string;
  gallery: string[];
  description: string;
  createdAt: string;
  featured?: boolean;
}
export interface VehicleFilter {
  keyword: string;
  categories: VehicleCategory[];
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  fuel?: string;
  transmission?: string;
  availableOnly: boolean;
  sort: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest';
}
export interface Voucher {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  expiresAt: string;
}
export interface BookingPricePreview {
  rentalDays: number;
  dailyRate: number;
  subtotal: number;
  discount: number;
  total: number;
  voucher?: Voucher;
}
export interface Booking {
  id: string;
  reference: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  pickupDate: string;
  returnDate: string;
  contactNumber: string;
  renterAge: number;
  preview: BookingPricePreview;
  status: BookingStatus;
  paymentStatus: 'pay_at_pickup' | 'paid' | 'refunded';
  createdAt: string;
}
export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  status: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}
export interface Receipt {
  booking: Booking;
  customer: User;
  vehicle: Vehicle;
  issuedAt: string;
}
export interface SupportMessage {
  id: string;
  userId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'sent';
}
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
export interface NotificationPreferences {
  bookingUpdates: boolean;
  promotions: boolean;
  reminders: boolean;
}
export interface CustomerProfile extends User {
  phone: string;
  notifications: NotificationPreferences;
}
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
export interface AuthCredentials {
  email: string;
  password: string;
}
export interface Registration {
  fullName: string;
  email: string;
  password: string;
  privacyConsent: boolean;
  licenseFileName?: string;
}
export interface BookingDraft {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  contactNumber: string;
  renterAge: number;
  voucherCode?: string;
  licenseFileName?: string;
}
