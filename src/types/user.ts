export type UserRole = 'customer' | 'provider';
export type ProviderAvailability = 'available' | 'offlineToday';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  serviceName?: string;
  experience?: string;
  category?: string;
  availability?: ProviderAvailability;
  createdAt?: number;
}

export interface SignUpProfilePayload {
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  serviceName?: string;
  experience?: string;
  category?: string;
  availability?: ProviderAvailability;
}
