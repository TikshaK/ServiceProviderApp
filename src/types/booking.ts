import { Service } from './service';
import { UserProfile } from './user';

export type BookingStatus = 'pending' | 'accepted' | 'inProgress' | 'completed' | 'cancelled' | 'declined';

export const isBookingExpired = (booking: Pick<Booking, 'status' | 'scheduledDate' | 'scheduledTime'>): boolean => {
  if (booking.status !== 'pending') return false;

  const scheduledAt = new Date(`${booking.scheduledDate} ${booking.scheduledTime}`).getTime();
  return Number.isFinite(scheduledAt) && scheduledAt < Date.now();
};

export interface BookingAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  addressSnapshot: BookingAddress;
  serviceSnapshot: Pick<Service, 'title' | 'durationMinutes' | 'price' | 'currency' | 'imageUrls'>;
  customerSnapshot: Pick<UserProfile, 'uid' | 'fullName' | 'email' | 'phone'>;
  providerSnapshot: Pick<UserProfile, 'uid' | 'fullName' | 'serviceName'>;
  specialInstructions?: string;
  baseAmount: number;
  platformFee: number;
  totalAmount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBookingPayload {
  customerId: string;
  providerId: string;
  service: Service;
  customer: UserProfile;
  provider: UserProfile;
  scheduledDate: string;
  scheduledTime: string;
  address: BookingAddress;
  specialInstructions?: string;
  platformFee?: number;
}
