import { equalTo, get, getDatabase, onValue, 
  orderByChild, push, query, ref, set, update
 } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { SignUpProfilePayload, UserProfile } from '../../types/user';
import { CreateServicePayload, Service } from '../../types/service';
import { Booking, BookingStatus, CreateBookingPayload } from '../../types/booking';
import { CustomerAddress } from '../../types/address';
import { Review } from '../../types/review';
import { AppNotification, NotificationType } from '../../types/notification';

const database = getDatabase(getApp());

const now = () => Date.now();

function snapshotValues<T>(snapshot: any): T[] {
  const value = snapshot.val() as Record<string, T | null> | null;
  return value ? Object.entries(value).filter(([, item]) => item != null).map(([id, item]) => ({ ...(item as object), id } as T)) : [];
}

export async function saveUserProfile(uid: string, payload: SignUpProfilePayload): Promise<UserProfile> {
  const profile: UserProfile = {
    uid,
    email: payload.email,
    fullName: payload.fullName,
    phone: payload.phone,
    avatarUrl: payload.avatarUrl,
    role: payload.role,
    serviceName: payload.serviceName,
    experience: payload.experience,
    category: payload.category,
    availability: 'available',
    createdAt: Date.now(),
  };

  console.log('[DB] saveUserProfile -> path: users/', uid, '| profile:', { ...profile });
  await set(ref(database, `users/${uid}`), profile);
  console.log('[DB] saveUserProfile SUCCESS at users/', uid);
  return profile;
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
  await set(ref(database, `users/${profile.uid}`), profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // console.log('[DB] getUserProfile <- path: users/', uid);
  const snapshot = await get(ref(database, `users/${uid}`));
  // console.log('[DB] getUserProfile snapshot.exists:', snapshot.exists(), snapshot.exists() ? snapshot.val() : '');

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as UserProfile;
}

export async function isRegisteredEmail(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const usersQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(normalizedEmail));
  const snapshot = await get(usersQuery);
  return snapshot.exists();
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
  const serviceRef = push(ref(database, 'services'));
  const timestamp = now();
  const service: Service = {
    id: serviceRef.key as string,
    providerId: payload.providerId,
    providerName: payload.providerName,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    durationMinutes: payload.durationMinutes,
    price: payload.price,
    currency: payload.currency ?? 'USD',
    imageUrls: payload.imageUrls ?? [],
    isActive: payload.isActive ?? true,
    ratingAverage: 0,
    reviewCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await update(ref(database), {
    [`services/${service.id}`]: service,
    [`providerServiceIndex/${service.providerId}/${service.id}`]: true,
  });
  return service;
}

export async function updateService(service: Service): Promise<void> {
  await update(ref(database), {
    [`services/${service.id}`]: { ...service, updatedAt: now() },
    [`providerServiceIndex/${service.providerId}/${service.id}`]: true,
  });
}

export async function deleteService(service: Service): Promise<void> {
  await update(ref(database), {
    [`services/${service.id}`]: null,
    [`providerServiceIndex/${service.providerId}/${service.id}`]: null,
  });
}

export async function getService(serviceId: string): Promise<Service | null> {
  const snapshot = await get(ref(database, `services/${serviceId}`));
  const val = snapshot.val();
  return (snapshot.exists() && val != null) ? ({ id: serviceId, ...val } as Service) : null;
}

export async function getServices(options: { providerId?: string; category?: string; activeOnly?: boolean } = {}): Promise<Service[]> {
  const serviceQuery = options.providerId
    ? query(ref(database, 'services'), orderByChild('providerId'), equalTo(options.providerId))
    : options.category
      ? query(ref(database, 'services'), orderByChild('category'), equalTo(options.category))
      : ref(database, 'services');
  const services = snapshotValues<Service>(await get(serviceQuery)).filter(s => s != null);
  const visibleServices = options.providerId
    ? services
    : await Promise.all(services.map(async service => {
      const provider = await getUserProfile(service.providerId);
      return provider?.availability === 'offlineToday' ? null : service;
    })).then(items => items.filter((service): service is Service => service != null));
  return options.activeOnly === false ? visibleServices : visibleServices.filter(service => service.isActive !== false);
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const bookingRef = push(ref(database, 'bookings'));
  const timestamp = now();
  const platformFee = payload.platformFee ?? Number((payload.service.price * 0.05));
  // const platformFee = payload.platformFee ?? Number((payload.service.price * 0.05).toFixed(2));
  const booking: Booking = {
    id: bookingRef.key as string,
    customerId: payload.customerId,
    providerId: payload.providerId,
    serviceId: payload.service.id,
    status: 'pending',
    scheduledDate: payload.scheduledDate,
    scheduledTime: payload.scheduledTime,
    scheduledDateTime: payload.scheduledDateTime,
    addressSnapshot: payload.address,
    serviceSnapshot: {
      title: payload.service.title,
      durationMinutes: payload.service.durationMinutes,
      price: payload.service.price,
      currency: payload.service.currency,
      imageUrls: payload.service.imageUrls ?? [],
    },
    customerSnapshot: {
      uid: payload.customer.uid,
      fullName: payload.customer.fullName,
      email: payload.customer.email,
      phone: payload.customer.phone,
    },
    providerSnapshot: {
      uid: payload.provider.uid,
      fullName: payload.provider.fullName,
      serviceName: payload.provider.serviceName,
    },
    specialInstructions: payload.specialInstructions,
    baseAmount: payload.service.price,
    platformFee,
    totalAmount: payload.service.price + platformFee,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await update(ref(database), {
    [`bookings/${booking.id}`]: booking,
    [`customerBookingIndex/${booking.customerId}/${booking.id}`]: true,
    [`providerBookingIndex/${booking.providerId}/${booking.id}`]: true,
  });
  await createNotification(booking.providerId, 'bookingCreated', 'New booking request', `${booking.customerSnapshot.fullName} requested ${booking.serviceSnapshot.title}.`, booking.id, booking.customerId);
  return booking;
}

export async function getBookings(field: 'customerId' | 'providerId', value: string, status?: BookingStatus): Promise<Booking[]> {
  const bookingQuery = query(ref(database, 'bookings'), orderByChild(field), equalTo(value));
  const bookings = snapshotValues<Booking>(await get(bookingQuery));
  const result = status ? bookings.filter(booking => booking.status === status) : bookings;
  return result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<void> {
  try {
    const bookingSnap = await get(ref(database, `bookings/${bookingId}`));
    const booking = bookingSnap.exists() ? { id: bookingId, ...bookingSnap.val() } as any : null;
    if (!booking) {
      throw new Error('Booking not found');
    }

    const updatedAt = now();
    await update(ref(database, `bookings/${bookingId}`), { status, updatedAt });

    // Determine notification type and recipient
    const isCancelled = status === 'cancelled';
    let notificationType: NotificationType;
    let title: string;
    let body: string;
    let recipientId: string;

    if (status === 'accepted') {
      notificationType = 'bookingAccepted';
      title = 'Booking Accepted';
      body = `${booking.providerSnapshot?.fullName ?? 'Provider'} accepted your booking.`;
      recipientId = booking.customerId;
    } else if (status === 'declined') {
      notificationType = 'bookingDeclined';
      title = 'Booking Declined';
      body = `${booking.providerSnapshot?.fullName ?? 'Provider'} declined your booking.`;
      recipientId = booking.customerId;
    } else if (status === 'completed') {
      notificationType = 'bookingCompleted';
      title = 'Booking Completed';
      body = `${booking.providerSnapshot?.fullName ?? 'Provider'} has completed the job.`;
      recipientId = booking.customerId;
    } else if (isCancelled) {
      notificationType = 'bookingCancelled';
      title = 'Booking Cancelled';
      body = `This booking has been cancelled.`;
      await createNotification(booking.customerId, 'bookingCancelled', 'Booking Cancelled', `This booking has been cancelled.`, bookingId, booking.providerId);
      await createNotification(booking.providerId, 'bookingCancelled', 'Booking Cancelled', `This booking has been cancelled.`, bookingId, booking.customerId);
      return;
    } else {
      return;
    }

    await createNotification(recipientId, notificationType, title, body, bookingId, booking.providerId);
  } catch (error) {
    console.error('[DB] updateBookingStatus FAILED', {
      bookingId,
      status,
      error,
    });

    throw new Error('Unable to update booking status. Please try again.');
  }
}

export async function saveAddress(customerId: string, address: CustomerAddress): Promise<void> {
  const updates: Record<string, CustomerAddress | boolean> = {
    [`addresses/${customerId}/${address.id}`]: address,
  };

  if (address.isDefault) {
    const existingAddresses = await getAddresses(customerId);
    existingAddresses.forEach(existingAddress => {
      if (existingAddress.id !== address.id && existingAddress.isDefault) {
        updates[`addresses/${customerId}/${existingAddress.id}/isDefault`] = false;
      }
    });
  }

  await update(ref(database), updates);
}

export async function getAddresses(customerId: string): Promise<CustomerAddress[]> {
  return snapshotValues<CustomerAddress>(await get(ref(database, `addresses/${customerId}`)));
}

export async function deleteAddress(customerId: string, addressId: string): Promise<void> {
  await update(ref(database), {
    [`addresses/${customerId}/${addressId}`]: null,
  });
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const reviewRef = push(ref(database, 'reviews'));
  const savedReview: Review = { ...review, id: reviewRef.key as string, createdAt: now() };
  await update(ref(database), {
    [`reviews/${savedReview.id}`]: savedReview,
    [`providerReviewIndex/${savedReview.revieweeId}/${savedReview.id}`]: true,
  });
  await createNotification(savedReview.revieweeId, 'newReview', 'New review received', 'A customer left a review for your service.', savedReview.bookingId, savedReview.reviewerId);
  return savedReview;
}

export async function getReviews(revieweeId: string): Promise<Review[]> {
  const reviewQuery = query(ref(database, 'reviews'), orderByChild('revieweeId'), equalTo(revieweeId));
  return snapshotValues<Review>(await get(reviewQuery));
}

export async function getReviewsByReviewerId(reviewerId: string): Promise<Review[]> {
  const reviewQuery = query(ref(database, 'reviews'), orderByChild('reviewerId'), equalTo(reviewerId));
  return snapshotValues<Review>(await get(reviewQuery));
}

export async function deleteAccount(uid: string): Promise<void> {
  try {
    // 1. Delete the Firebase Auth user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      await currentUser.delete();
    }

    // 2. Cancel all active bookings for this provider
    const activeBookings = await getBookings('providerId', uid);
    const cancellableBookings = activeBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
    await Promise.allSettled(cancellableBookings.map(booking => updateBookingStatus(booking.id, 'cancelled')));

    // 3. Delete all services for this provider (including inactive ones)
    const services = await getServices({ providerId: uid, activeOnly: false });
    await Promise.allSettled(services.map(service => deleteService(service)));

    // 4. Clean up provider booking index, user profile, and notifications
    const bookingIds = cancellableBookings.map(b => b.id);
    const updates: Record<string, null> = {
      [`users/${uid}`]: null,
      [`notifications/${uid}`]: null,
    };
    bookingIds.forEach(id => {
      updates[`providerBookingIndex/${uid}/${id}`] = null;
    });
    await update(ref(database), updates);
  } catch (error) {
    console.error('[DB] deleteAccount FAILED', { uid, error });
    throw new Error('Unable to delete account. Please try again.');
  }
}

export async function createNotification(to: string, type: NotificationType, title: string, body: string, bookingId?: string, senderId?: string): Promise<void> {
  const notificationRef = push(ref(database, `notifications/${to}`));
  const notification: AppNotification = {
    id: notificationRef.key as string,
    senderId,
    type,
    title,
    body,
    bookingId,
    isRead: false,
    createdAt: now(),
  };
  await set(notificationRef, notification);
}

export function subscribeToNotifications(uid: string, onChange: (items: AppNotification[]) => void): () => void {
  return onValue(ref(database, `notifications/${uid}`), snapshot => onChange(snapshotValues<AppNotification>(snapshot)));
}

export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  await update(ref(database, `notifications/${uid}/${notificationId}`), { isRead: true });
}
