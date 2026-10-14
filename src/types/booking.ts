import { Service } from './service';
import { UserProfile } from './user';

export type BookingStatus = 'pending' | 'quotePending' | 'accepted' | 'inProgress' | 'completionRequested' | 'completed' | 'cancelled' | 'declined' | 'expired';
export type BookingType = 'direct' | 'open';

export const isBookingExpired = (
  booking: Pick<
    Booking, 'status'
    | 'scheduledDateTime' | 'scheduledDate' | 'scheduledTime' | 'scheduledAt'
  >)
  : boolean => {
  if (booking.status === 'expired') return true;
  if (booking.status !== 'pending' && booking.status !== 'quotePending') return false;

  const scheduledAt = booking.scheduledAt
    ? booking.scheduledAt
    : booking.scheduledDateTime
    ? new Date(booking.scheduledDateTime).getTime()
    : new Date(`${booking.scheduledDate} ${booking.scheduledTime}`).getTime();

  return Number.isFinite(scheduledAt) && scheduledAt < Date.now();
};

export interface BookingAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
}

export interface BookingQuote {
  quoteId?: string;
  providerId: string;
  providerName?: string | null;
  providerSnapshot?: Pick<UserProfile, 'uid' | 'fullName' | 'serviceName'> | null;
  amount: number;
  fee: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export function hasActiveProviderQuote(
  booking: {
    quotes?: Record<string, BookingQuote>;
    quoteHistory?: Record<string, BookingQuote>;
  },
  providerId?: string | null,
): boolean {
  if (!providerId) return false;

  const currentQuote = booking.quotes?.[providerId];
  if (currentQuote) {
    return currentQuote.status !== 'rejected';
  }

  const latestHistoricalQuote = Object.values(booking.quoteHistory ?? {})
    .filter(quote => quote.providerId === providerId)
    .sort((first, second) => second.createdAt - first.createdAt)[0];

  return Boolean(latestHistoricalQuote && latestHistoricalQuote.status !== 'rejected');
}

export interface Booking {
  id: string;
  customerId: string;
  providerId?: string | null;
  serviceId?: string | null;
  bookingType?: BookingType;
  category?: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  scheduledDateTime: string;
  scheduledAt?: number;
  addressSnapshot: BookingAddress;
  serviceSnapshot: Pick<Service, 'title' | 'durationMinutes' | 'price' | 'currency' | 'imageUrls'>;
  customerSnapshot: Pick<UserProfile, 'uid' | 'fullName' | 'email' | 'phone'>;
  providerSnapshot?: Pick<UserProfile, 'uid' | 'fullName' | 'serviceName'> | null;
  specialInstructions?: string | null;
  quotedAmount?: number;
  quoteSubmittedAt?: number;
  quotes?: Record<string, BookingQuote>;
  quoteHistory?: Record<string, BookingQuote>;
  completionRequestedAt?: number;
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
  provider: Pick<UserProfile, 'uid' | 'fullName' | 'serviceName'>;
  scheduledDate: string;
  scheduledTime: string;
  scheduledDateTime: string;
  address: BookingAddress;
  specialInstructions?: string;
  platformFee?: number;
}

export interface CreateOpenBookingPayload {
  customerId: string;
  customer: UserProfile;
  category: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledDateTime: string;
  scheduledAt: number;
  address: BookingAddress;
  specialInstructions?: string;
}

export interface OpenBookingListing {
  id: string;
  customerId: string;
  category: string;
  customerName: string;
  customerAvatarUrl?: string;
  city: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledAt: number;
  specialInstructions?: string;
  status: 'pending' | 'quotePending' | 'accepted' | 'expired';
  providerId?: string | null;
  providerName?: string | null;
  quotedAmount?: number | null;
  quotedFee?: number | null;
  quotes?: Record<string, BookingQuote>;
  quoteHistory?: Record<string, BookingQuote>;
  createdAt: number;
}
