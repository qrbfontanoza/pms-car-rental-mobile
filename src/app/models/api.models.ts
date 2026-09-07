import { User } from './domain.models';

export interface ApiEnvelope<T> {
  data: T;
  message: string;
  meta: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    fieldErrors: Record<string, string>;
    requestId: string;
  };
}

export interface ApiSessionDto {
  user: User;
  sessionId: string;
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
}

export interface StoredAuthSession extends Omit<ApiSessionDto, 'user'> {
  user: User;
}

export interface VehicleDto {
  id: string | number;
  name?: string;
  title?: string;
  category: string;
  dailyRate?: number;
  price_per_day?: number;
  seats: number;
  fuelType?: string;
  fuel?: string;
  transmission: string;
  totalUnits?: number;
  units_total?: number;
  availableUnits?: number;
  available_units?: number;
  imageUrl?: string | null;
  thumbnail?: string | null;
  gallery?: string[];
  description?: string;
  createdAt?: string | null;
  created_at?: string | null;
  featured?: boolean;
}
