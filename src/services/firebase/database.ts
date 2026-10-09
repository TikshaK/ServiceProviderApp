import { equalTo, get, getDatabase, onValue, 
  orderByChild, push, query, ref, runTransaction, set, update
 } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from '@react-native-firebase/auth';
import { PublicProviderProfile, SignUpProfilePayload, UserProfile } from '../../types/user';
import { CreateServicePayload, Service } from '../../types/service';
import { Booking, BookingStatus, CreateBookingPayload, CreateOpenBookingPayload, OpenBookingListing } from '../../types/booking';
import { CustomerAddress } from '../../types/address';
import { Review } from '../../types/review';
import { AppNotification, NotificationType } from '../../types/notification';

const database = getDatabase(getApp());

const now = () => Date.now();

function toOpenBookingListing(
  id: string,
  item: Omit<OpenBookingListing, 'id'> & { id?: string },
  category?: string,
): OpenBookingListing {
  return {
    ...item,
    id,
    ...(category ? { category } : {}),
    specialInstructions: typeof item.specialInstructions === 'string' ? item.specialInstructions : undefined,
  } as OpenBookingListing;
}

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
  const updates: Record<string, UserProfile | PublicProviderProfile> = {
    [`users/${uid}`]: profile,
  };
  if (profile.role === 'provider') {
    updates[`providerPublicProfiles/${uid}`] = toPublicProviderProfile(profile);
  }
  await update(ref(database), updates);
  console.log('[DB] saveUserProfile SUCCESS at users/', uid);
  return profile;
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
  const updates: Record<string, unknown> = {
    [`users/${profile.uid}`]: profile,
    [`providerPublicProfiles/${profile.uid}`]: profile.role === 'provider' ? toPublicProviderProfile(profile) : null,
  };

  if (profile.role === 'customer') {
    const snapshot = await get(ref(database, 'openBookingListings'));
    const categories = snapshot.val() as Record<string, Record<string, OpenBookingListing> | null> | null;
    Object.entries(categories ?? {}).forEach(([category, listings]) => {
      Object.entries(listings ?? {}).forEach(([bookingId, listing]) => {
        if (listing.customerId !== profile.uid || (listing.status !== 'pending' && listing.status !== 'quotePending')) return;
        updates[`openBookingListings/${category}/${bookingId}/customerName`] = profile.fullName;
        updates[`openBookingListings/${category}/${bookingId}/customerAvatarUrl`] = profile.avatarUrl ?? null;
      });
    });
  }

  await update(ref(database), updates);
  return profile;
}

function toPublicProviderProfile(profile: UserProfile): PublicProviderProfile {
  return {
    uid: profile.uid,
    fullName: profile.fullName,
    role: 'provider',
    ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    ...(profile.serviceName ? { serviceName: profile.serviceName } : {}),
    ...(profile.experience ? { experience: profile.experience } : {}),
    ...(profile.category ? { category: profile.category } : {}),
    availability: profile.availability ?? 'available',
  };
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

export async function getProviderPublicProfile(uid: string): Promise<PublicProviderProfile | null> {
  const snapshot = await get(ref(database, `providerPublicProfiles/${uid}`));
  return snapshot.exists() ? snapshot.val() as PublicProviderProfile : null;
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
      const provider = await getProviderPublicProfile(service.providerId);
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
    bookingType: 'direct',
    category: payload.service.category,
    status: 'pending',
    scheduledDate: payload.scheduledDate,
    scheduledTime: payload.scheduledTime,
    scheduledDateTime: payload.scheduledDateTime,
    scheduledAt: new Date(payload.scheduledDateTime).getTime(),
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
      ...(payload.provider.serviceName ? { serviceName: payload.provider.serviceName } : {}),
    },
    ...(payload.specialInstructions ? { specialInstructions: payload.specialInstructions } : {}),
    baseAmount: payload.service.price,
    platformFee,
    totalAmount: payload.service.price + platformFee,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await update(ref(database), {
    [`bookings/${booking.id}`]: booking,
    [`customerBookingIndex/${booking.customerId}/${booking.id}`]: true,
  });
  await set(ref(database, `providerBookingIndex/${booking.providerId}/${booking.id}`), true);
  await createNotification(payload.providerId, 'bookingCreated', 'New booking request', `${booking.customerSnapshot.fullName} requested ${booking.serviceSnapshot.title}.`, booking.id, booking.customerId);
  return booking;
}

export async function createOpenBooking(payload: CreateOpenBookingPayload): Promise<Booking> {
  const bookingRef = push(ref(database, 'bookings'));
  const timestamp = now();
  const booking: Booking = {
    id: bookingRef.key as string,
    customerId: payload.customerId,
    providerId: null,
    serviceId: null,
    bookingType: 'open',
    category: payload.category,
    status: 'pending',
    scheduledDate: payload.scheduledDate,
    scheduledTime: payload.scheduledTime,
    scheduledDateTime: payload.scheduledDateTime,
    scheduledAt: payload.scheduledAt,
    addressSnapshot: payload.address,
    serviceSnapshot: {
      title: `${payload.category} service`,
      durationMinutes: 0,
      price: 0,
      currency: 'USD',
      imageUrls: [],
    },
    customerSnapshot: {
      uid: payload.customer.uid,
      fullName: payload.customer.fullName,
      email: payload.customer.email,
      phone: payload.customer.phone,
    },
    ...(payload.specialInstructions ? { specialInstructions: payload.specialInstructions } : {}),
    baseAmount: 0,
    platformFee: 0,
    totalAmount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await update(ref(database), {
    [`bookings/${booking.id}`]: booking,
    [`customerBookingIndex/${booking.customerId}/${booking.id}`]: true,
    [`openBookingListings/${payload.category}/${booking.id}`]: {
      id: booking.id,
      customerId: booking.customerId,
      category: payload.category,
      customerName: payload.customer.fullName,
      ...(payload.customer.avatarUrl ? { customerAvatarUrl: payload.customer.avatarUrl } : {}),
      city: payload.address.city,
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTime,
      scheduledAt: payload.scheduledAt,
      ...(payload.specialInstructions ? { specialInstructions: payload.specialInstructions } : {}),
      status: 'pending',
      createdAt: timestamp,
    },
  });
  return booking;
}

export async function getOpenBookings(category: string): Promise<OpenBookingListing[]> {
  const snapshot = await get(ref(database, `openBookingListings/${category}`));
  const listings = snapshot.val() as Record<string, Omit<OpenBookingListing, 'id'> & { id?: string }> | null;
  return Object.entries(listings ?? {})
    .map(([id, item]) => toOpenBookingListing(id, item))
    .filter(item => item.status === 'pending' && item.scheduledAt > now())
    .sort((first, second) => first.scheduledAt - second.scheduledAt);
}

export async function getAllOpenBookings(): Promise<OpenBookingListing[]> {
  const snapshot = await get(ref(database, 'openBookingListings'));
  const categories = snapshot.val() as Record<string, Record<string, Omit<OpenBookingListing, 'id'> & { id?: string }> | null> | null;
  const allListings = Object.entries(categories ?? {})
    .flatMap(([category, listings]) =>
      Object.entries(listings ?? {}).map(([id, item]) => toOpenBookingListing(id, item, category)),
    );
  const pendingListings = allListings.filter(item => item.status === 'pending');
  const bookings = pendingListings
    .filter(item => item.scheduledAt > now())
    .sort((first, second) => first.scheduledAt - second.scheduledAt);

  console.log('[OPEN_BOOKINGS] feed summary', {
    categoryCount: Object.keys(categories ?? {}).length,
    totalListings: allListings.length,
    statusCounts: allListings.reduce<Record<string, number>>((counts, item) => {
      const status = String(item.status ?? 'missing');
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    }, {}),
    pendingCount: pendingListings.length,
    pendingWithFutureSchedule: bookings.length,
    pendingWithoutFutureSchedule: pendingListings
      .filter(item => !(item.scheduledAt > now()))
      .map(item => ({ id: item.id, category: item.category, scheduledAt: item.scheduledAt })),
  });

  return bookings;
}

export function subscribeToOpenBookings(
  category: string,
  onChange: (bookings: OpenBookingListing[]) => void,
): () => void {
  return onValue(ref(database, `openBookingListings/${category}`), snapshot => {
    const listings = snapshot.val() as Record<string, Omit<OpenBookingListing, 'id'> & { id?: string }> | null;
    const bookings = Object.entries(listings ?? {})
      .map(([id, item]) => toOpenBookingListing(id, item))
      .filter(item => item.status === 'pending' && item.scheduledAt > now())
      .sort((first, second) => first.scheduledAt - second.scheduledAt);
    onChange(bookings);
  });
}

export function subscribeToAllOpenBookings(
  onChange: (bookings: OpenBookingListing[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return onValue(ref(database, 'openBookingListings'), snapshot => {
    const categories = snapshot.val() as Record<string, Record<string, Omit<OpenBookingListing, 'id'> & { id?: string }> | null> | null;
    const bookings = Object.entries(categories ?? {})
      .flatMap(([category, listings]) =>
        Object.entries(listings ?? {}).map(([id, item]) => toOpenBookingListing(id, item, category)),
      )
      .filter(item => item.status === 'pending' && item.scheduledAt > now())
      .sort((first, second) => first.scheduledAt - second.scheduledAt);

    onChange(bookings);
  }, error => {
    if (onError) {
      onError(error);
      return;
    }
    console.error('[OPEN_BOOKINGS] subscription failed', error);
  });
}

export async function submitOpenBookingQuote(
  bookingId: string,
  category: string,
  provider: UserProfile,
  amount: number,
): Promise<void> {
  console.log('[QUOTE_SUBMIT] service started', {
    bookingId,
    category,
    providerId: provider.uid,
    providerRole: provider.role,
    amount,
  });
  if (!Number.isFinite(amount) || amount <= 0 || !category || provider.role !== 'provider') {
    console.error('[QUOTE_SUBMIT] input validation failed', {
      bookingId,
      validAmount: Number.isFinite(amount) && amount > 0,
      hasCategory: Boolean(category),
      providerRole: provider.role,
    });
    throw new Error('Enter a valid quote.');
  }

  const quotedAmount = Math.round(amount * 100) / 100;
  const platformFee = Math.round(quotedAmount * 0.05 * 100) / 100;
  const timestamp = now();
  const listingRef = ref(database, `openBookingListings/${category}/${bookingId}`);
  const listingSnapshot = await runQuoteApprovalStage(bookingId, 'quote-listing-read', () => get(listingRef));
  if (!listingSnapshot.exists()) {
    throw new Error('This open request could not be found in its category. Refresh the bookings list and try again.');
  }

  let syncedListing: OpenBookingListing | null = null;
  await runQuoteApprovalStage(bookingId, 'quote-listing-cache-sync', () => new Promise<void>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined;
    const timeout = setTimeout(() => {
      unsubscribe?.();
      reject(new Error('Unable to sync this request. Check your connection and try again.'));
    }, 10000);

    unsubscribe = onValue(listingRef, snapshot => {
      console.log('[QUOTE_SUBMIT] listing value listener event', {
        bookingId,
        category,
        exists: snapshot.exists(),
        status: snapshot.child('status').val(),
      });
      if (!snapshot.exists()) return;
      syncedListing = snapshot.val() as OpenBookingListing;
      clearTimeout(timeout);
      unsubscribe?.();
      resolve();
    }, error => {
      clearTimeout(timeout);
      unsubscribe?.();
      reject(error);
    });
  }));

  let transactionAttempt = 0;
  let prefetchedFallbackAvailable = true;
  const result = await runQuoteApprovalStage(bookingId, 'quote-listing-transaction', () => runTransaction(listingRef, current => {
    transactionAttempt += 1;
    let listing = current as OpenBookingListing | null;
    let usedFallback = false;
    if (!listing && prefetchedFallbackAvailable) {
      listing = syncedListing ?? listingSnapshot.val() as OpenBookingListing;
      prefetchedFallbackAvailable = false;
      usedFallback = true;
      console.warn('[QUOTE_SUBMIT] transaction using verified listing snapshot', {
        bookingId,
        category,
        attempt: transactionAttempt,
        fallbackStatus: listing.status,
      });
    }
    console.log('[QUOTE_SUBMIT] listing transaction callback', {
      bookingId,
      category,
      attempt: transactionAttempt,
      currentStatus: listing?.status,
      usedFallback,
    });
    if (!listing
      || listing.status !== 'pending'
      || listing.category !== category
      || (listing.scheduledAt ?? 0) <= timestamp) {
      console.warn('[QUOTE_SUBMIT] listing transaction aborting', {
        bookingId,
        category,
        attempt: transactionAttempt,
        reason: !listing ? 'missing-current-data' : listing.status !== 'pending' ? 'status-not-pending' : listing.category !== category ? 'category-mismatch' : 'request-expired',
      });
      return;
    }
    console.log('[QUOTE_SUBMIT] listing transaction transition', { bookingId, category, from: listing.status, to: 'quotePending' });
    return {
      ...listing,
      status: 'quotePending',
      providerId: provider.uid,
      providerName: provider.fullName,
      quotedAmount,
      quotedFee: platformFee,
    };
  }));
  console.log('[QUOTE_SUBMIT] listing transaction result', {
    bookingId,
    category,
    committed: result.committed,
    finalStatus: result.snapshot.child('status').val(),
  });

  if (!result.committed) {
    throw new Error(`This request could not be quoted (current status: ${result.snapshot.child('status').val() ?? 'missing'}). Refresh the bookings list and try again.`);
  }

  const listing = result.snapshot.val() as OpenBookingListing;
  try {
    await runQuoteApprovalStage(bookingId, 'quote-booking-update', () => update(ref(database), {
      [`bookings/${bookingId}/providerId`]: provider.uid,
      [`bookings/${bookingId}/providerSnapshot`]: {
        uid: provider.uid,
        fullName: provider.fullName,
        ...(provider.serviceName ? { serviceName: provider.serviceName } : {}),
      },
      [`bookings/${bookingId}/status`]: 'quotePending',
      [`bookings/${bookingId}/quotedAmount`]: quotedAmount,
      [`bookings/${bookingId}/quoteSubmittedAt`]: timestamp,
      [`bookings/${bookingId}/baseAmount`]: quotedAmount,
      [`bookings/${bookingId}/platformFee`]: platformFee,
      [`bookings/${bookingId}/totalAmount`]: quotedAmount + platformFee,
      [`bookings/${bookingId}/updatedAt`]: timestamp,
    }));
  } catch (error) {
    await runTransaction(listingRef, current => current?.providerId === provider.uid && current.status === 'quotePending'
      ? { ...current, status: 'pending', providerId: null, providerName: null, quotedAmount: null, quotedFee: null }
      : undefined);
    throw error;
  }
    await runQuoteApprovalStage(bookingId, 'quote-provider-index-update', () => set(ref(database, `providerBookingIndex/${provider.uid}/${bookingId}`), true));
    await runQuoteApprovalStage(bookingId, 'quote-customer-notification', () => createNotification(listing.customerId, 'bookingAccepted', 'Quote received', `${provider.fullName} sent a quote for ${listing.category}.`, bookingId, provider.uid));
    console.log('[QUOTE_SUBMIT] service completed', { bookingId, category, providerId: provider.uid });
}

async function runQuoteApprovalStage<T>(
  bookingId: string,
  stage: string,
  operation: () => Promise<T>,
): Promise<T> {
  console.log('[QUOTE_APPROVAL] stage started', { bookingId, stage });
  try {
    const result = await operation();
    console.log('[QUOTE_APPROVAL] stage completed', { bookingId, stage });
    return result;
  } catch (error) {
    console.error('[QUOTE_APPROVAL] stage failed', { bookingId, stage, error });
    throw error;
  }
}

export async function respondToOpenBookingQuote(
  bookingId: string,
  approve: boolean,
  expectedQuote?: { providerId?: string; quotedAmount?: number },
): Promise<void> {
  console.log('[QUOTE_APPROVAL] service started', { bookingId, approve });
  const bookingRef = ref(database, `bookings/${bookingId}`);
  const bookingSnapshot = await runQuoteApprovalStage(bookingId, 'booking-read', () => get(bookingRef));
  if (!bookingSnapshot.exists()) {
    const listingsSnapshot = await runQuoteApprovalStage(bookingId, 'open-listing-diagnostic-read', () => get(ref(database, 'openBookingListings')));
    const categories = listingsSnapshot.val() as Record<string, Record<string, OpenBookingListing> | null> | null;
    const matchingListing = Object.entries(categories ?? {}).find(([, listings]) => listings?.[bookingId]);
    const [category, listings] = matchingListing ?? [];
    const listing = category ? listings?.[bookingId] : undefined;
    console.error('[QUOTE_APPROVAL] booking record missing', {
      bookingId,
      listingCategory: category,
      listingStatus: listing?.status,
      listingCustomerId: listing?.customerId,
      listingProviderId: listing?.providerId,
    });
    throw new Error(listing
      ? 'The quote exists, but its booking record is missing. Ask the provider to resend the quote.'
      : 'This booking and its quote could not be found. Refresh your bookings and try again.');
  }

  let syncedBooking: Booking | null = null;
  await runQuoteApprovalStage(bookingId, 'native-cache-sync', () => new Promise<void>((resolve, reject) => {
    console.log('[QUOTE_APPROVAL] waiting for booking value listener', { bookingId });
    let unsubscribe: (() => void) | undefined;
    const timeout = setTimeout(() => {
      unsubscribe?.();
      console.error('[QUOTE_APPROVAL] booking value listener timed out', { bookingId });
      reject(new Error('Unable to sync this booking. Check your connection and try again.'));
    }, 10000);

    unsubscribe = onValue(bookingRef, snapshot => {
      console.log('[QUOTE_APPROVAL] booking value listener event', {
        bookingId,
        exists: snapshot.exists(),
        status: snapshot.child('status').val(),
        hasProviderId: Boolean(snapshot.child('providerId').val()),
      });
      if (!snapshot.exists()) return;
      syncedBooking = snapshot.val() as Booking;
      clearTimeout(timeout);
      unsubscribe?.();
      resolve();
    }, error => {
      clearTimeout(timeout);
      unsubscribe?.();
      console.error('[QUOTE_APPROVAL] booking value listener failed', { bookingId, error });
      reject(error);
    });
  }));

  let claimedProviderId: string | null = null;
  let transactionAttempt = 0;
  let prefetchedFallbackAvailable = true;
  const result = await runQuoteApprovalStage(bookingId, 'booking-transaction', () => runTransaction(bookingRef, current => {
    transactionAttempt += 1;
    let transactionBooking = current as Booking | null;
    let usedFallback = false;
    if (!transactionBooking && prefetchedFallbackAvailable) {
      transactionBooking = syncedBooking ?? bookingSnapshot.val() as Booking;
      prefetchedFallbackAvailable = false;
      usedFallback = true;
      console.warn('[QUOTE_APPROVAL] transaction using verified listener snapshot', {
        bookingId,
        attempt: transactionAttempt,
        fallbackStatus: transactionBooking.status,
        hasProviderId: Boolean(transactionBooking.providerId),
      });
    }
    console.log('[QUOTE_APPROVAL] transaction callback', {
      bookingId,
      attempt: transactionAttempt,
      currentStatus: transactionBooking?.status,
      hasProviderId: Boolean(transactionBooking?.providerId),
      usedFallback,
    });
    if (!transactionBooking || transactionBooking.status !== 'quotePending' || !transactionBooking.providerId) {
      console.warn('[QUOTE_APPROVAL] transaction callback aborting', {
        bookingId,
        attempt: transactionAttempt,
        reason: !transactionBooking ? 'missing-current-data' : transactionBooking.status !== 'quotePending' ? 'status-not-quotePending' : 'missing-provider-id',
      });
      return;
    }

    claimedProviderId = transactionBooking.providerId;
    const timestamp = now();
    if (approve) {
      console.log('[QUOTE_APPROVAL] transaction transition', { bookingId, from: transactionBooking.status, to: 'accepted' });
      return { ...transactionBooking, status: 'accepted', updatedAt: timestamp };
    }

    if ((transactionBooking.scheduledAt ?? 0) <= timestamp) {
      console.log('[QUOTE_APPROVAL] transaction transition', { bookingId, from: transactionBooking.status, to: 'expired' });
      return { ...transactionBooking, status: 'expired', providerId: null, providerSnapshot: null, updatedAt: timestamp };
    }

    console.log('[QUOTE_APPROVAL] transaction transition', { bookingId, from: transactionBooking.status, to: 'pending' });
    return {
      ...transactionBooking,
      status: 'pending',
      providerId: null,
      providerSnapshot: null,
      quotedAmount: null,
      quoteSubmittedAt: null,
      baseAmount: 0,
      platformFee: 0,
      totalAmount: 0,
      updatedAt: timestamp,
    };
  }));
  console.log('[QUOTE_APPROVAL] transaction result', {
    bookingId,
    committed: result.committed,
    finalStatus: result.snapshot.child('status').val(),
    hasProviderId: Boolean(result.snapshot.child('providerId').val()),
  });

  let booking: Booking;
  if (!result.committed) {
    const currentSnapshot = await runQuoteApprovalStage(bookingId, 'booking-read-after-transaction-abort', () => get(bookingRef));
    const current = currentSnapshot.val() as Booking | null ?? result.snapshot.val() as Booking | null;
    console.warn('[QUOTE_APPROVAL] transaction not committed', {
      bookingId,
      currentStatus: current?.status,
      hasProviderId: Boolean(current?.providerId),
    });
    if (!current) {
      throw new Error('This booking could not be found. Refresh your bookings and try again.');
    }
    if (current.status === 'expired' || (current.status === 'quotePending' && (current.scheduledAt ?? 0) <= now())) {
      throw new Error('This quote has expired because the scheduled service time has passed.');
    }
    if (current.status === 'accepted' && approve && current.bookingType === 'open' && current.providerId) {
      booking = current;
      claimedProviderId = current.providerId;
      console.warn('[QUOTE_APPROVAL] reconciling previously approved booking', {
        bookingId,
        providerId: current.providerId,
      });
    } else if (current.status === 'accepted') {
      throw new Error('This quote has already been approved. Refresh your bookings to see the confirmed booking.');
    } else if (current.status === 'quotePending' && !current.providerId) {
      throw new Error('The quote is missing its provider details. Ask the provider to send the quote again.');
    } else if (!approve && current.status === 'pending' && current.bookingType === 'open' && current.category) {
      const listingRef = ref(database, `openBookingListings/${current.category}/${bookingId}`);
      const listingSnapshot = await runQuoteApprovalStage(bookingId, 'decline-recovery-listing-read', () => get(listingRef));
      const listing = listingSnapshot.val() as OpenBookingListing | null;
      if (
        listing?.status === 'quotePending'
        && listing.providerId
        && listing.providerId === expectedQuote?.providerId
        && listing.quotedAmount === expectedQuote.quotedAmount
      ) {
        booking = current;
        claimedProviderId = listing.providerId;
        console.warn('[QUOTE_APPROVAL] reconciling previously declined booking', {
          bookingId,
          providerId: listing.providerId,
        });
      } else {
        throw new Error(`This quote is no longer awaiting approval (current status: ${current.status}). Refresh your bookings and try again.`);
      }
    } else {
      throw new Error(`This quote is no longer awaiting approval (current status: ${current.status}). Refresh your bookings and try again.`);
    }
  } else {
    booking = result.snapshot.val() as Booking;
  }

  if (!approve && booking.status !== 'expired' && booking.category && claimedProviderId) {
    const listingRef = ref(database, `openBookingListings/${booking.category}/${bookingId}`);
    const listingSnapshot = await runQuoteApprovalStage(bookingId, 'decline-listing-read', () => get(listingRef));
    const listing = listingSnapshot.val() as OpenBookingListing | null;
    const quotedAmount = expectedQuote?.quotedAmount ?? booking.quotedAmount;
    if (
      listing?.status === 'quotePending'
      && listing.providerId === claimedProviderId
      && listing.quotedAmount === quotedAmount
    ) {
      let syncedListing: OpenBookingListing | null = null;
      await runQuoteApprovalStage(bookingId, 'decline-listing-cache-sync', () => new Promise<void>((resolve, reject) => {
        let unsubscribe: (() => void) | undefined;
        const timeout = setTimeout(() => {
          unsubscribe?.();
          reject(new Error('Unable to sync this request. Check your connection and try again.'));
        }, 10000);

        unsubscribe = onValue(listingRef, snapshot => {
          if (!snapshot.exists()) return;
          syncedListing = snapshot.val() as OpenBookingListing;
          clearTimeout(timeout);
          unsubscribe?.();
          resolve();
        }, error => {
          clearTimeout(timeout);
          unsubscribe?.();
          reject(error);
        });
      }));

      let listingFallbackAvailable = true;
      await runQuoteApprovalStage(bookingId, 'decline-listing-reset', () => runTransaction(listingRef, current => {
        let transactionListing = current as OpenBookingListing | null;
        if (!transactionListing && listingFallbackAvailable) {
          transactionListing = syncedListing ?? listing;
          listingFallbackAvailable = false;
        }
        if (!transactionListing
          || transactionListing.status !== 'quotePending'
          || transactionListing.providerId !== claimedProviderId
          || transactionListing.quotedAmount !== quotedAmount) {
          return;
        }
        return {
          ...transactionListing,
          status: 'pending',
          providerId: null,
          providerName: null,
          quotedAmount: null,
          quotedFee: null,
        };
      }).then(listingResetResult => {
        if (!listingResetResult.committed && listingResetResult.snapshot.child('status').val() !== 'pending') {
          throw new Error('The request could not be reopened. Refresh the booking and try again.');
        }
      }));
    } else if (listing?.status !== 'pending') {
      throw new Error('The request could not be reopened because it no longer matches this quote. Refresh the bookings and try again.');
    }
  }
  if (approve && claimedProviderId) {
    await runQuoteApprovalStage(bookingId, 'provider-notification', () => createNotification(claimedProviderId as string, 'bookingAccepted', 'Quote approved', `${booking.customerSnapshot.fullName} approved your quote.`, bookingId, booking.customerId));
  } else if (claimedProviderId) {
    await runQuoteApprovalStage(bookingId, 'provider-notification', () => createNotification(claimedProviderId as string, 'bookingDeclined', 'Quote declined', `${booking.customerSnapshot.fullName} declined your quote.`, bookingId, booking.customerId));
  }
  console.log('[QUOTE_APPROVAL] service completed', { bookingId, approve });
}

export async function requestBookingCompletion(bookingId: string, providerId: string): Promise<void> {
  console.log('[BOOKING_COMPLETION] service started', { bookingId, providerId });
  const bookingRef = ref(database, `bookings/${bookingId}`);
  const bookingSnapshot = await get(bookingRef);
  console.log('[BOOKING_COMPLETION] booking read', {
    bookingId,
    exists: bookingSnapshot.exists(),
    status: bookingSnapshot.child('status').val(),
    providerMatches: bookingSnapshot.child('providerId').val() === providerId,
  });
  if (!bookingSnapshot.exists()) {
    throw new Error('This booking could not be found. Refresh your bookings and try again.');
  }

  let syncedBooking: Booking | null = null;
  await new Promise<void>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined;
    const timeout = setTimeout(() => {
      unsubscribe?.();
      console.error('[BOOKING_COMPLETION] booking value listener timed out', { bookingId });
      reject(new Error('Unable to sync this booking. Check your connection and try again.'));
    }, 10000);

    unsubscribe = onValue(bookingRef, snapshot => {
      console.log('[BOOKING_COMPLETION] booking value listener event', {
        bookingId,
        exists: snapshot.exists(),
        status: snapshot.child('status').val(),
        providerMatches: snapshot.child('providerId').val() === providerId,
      });
      if (!snapshot.exists()) return;
      syncedBooking = snapshot.val() as Booking;
      clearTimeout(timeout);
      unsubscribe?.();
      resolve();
    }, error => {
      clearTimeout(timeout);
      unsubscribe?.();
      console.error('[BOOKING_COMPLETION] booking value listener failed', { bookingId, error });
      reject(error);
    });
  });

  let transactionAttempt = 0;
  let prefetchedFallbackAvailable = true;
  const result = await runTransaction(bookingRef, current => {
    transactionAttempt += 1;
    let transactionBooking = current as Booking | null;
    let usedFallback = false;
    if (!transactionBooking && prefetchedFallbackAvailable) {
      transactionBooking = syncedBooking ?? bookingSnapshot.val() as Booking;
      prefetchedFallbackAvailable = false;
      usedFallback = true;
      console.warn('[BOOKING_COMPLETION] transaction using verified listener snapshot', {
        bookingId,
        attempt: transactionAttempt,
        fallbackStatus: transactionBooking.status,
      });
    }
    const providerMatches = transactionBooking?.providerId === providerId;
    console.log('[BOOKING_COMPLETION] transaction callback', {
      bookingId,
      attempt: transactionAttempt,
      currentStatus: transactionBooking?.status,
      providerMatches,
      usedFallback,
    });
    if (!transactionBooking
      || !providerMatches
      || (transactionBooking.status !== 'accepted' && transactionBooking.status !== 'inProgress')) {
      console.warn('[BOOKING_COMPLETION] transaction callback aborting', {
        bookingId,
        attempt: transactionAttempt,
        reason: !transactionBooking ? 'missing-current-data' : !providerMatches ? 'provider-mismatch' : 'status-not-active',
      });
      return;
    }
    const timestamp = now();
    console.log('[BOOKING_COMPLETION] transaction transition', {
      bookingId,
      from: transactionBooking.status,
      to: 'completionRequested',
    });
    return { ...transactionBooking, status: 'completionRequested', completionRequestedAt: timestamp, updatedAt: timestamp };
  });
  console.log('[BOOKING_COMPLETION] transaction result', {
    bookingId,
    committed: result.committed,
    finalStatus: result.snapshot.child('status').val(),
  });
  if (!result.committed) {
    console.error('[BOOKING_COMPLETION] transaction not committed', {
      bookingId,
      currentStatus: result.snapshot.child('status').val(),
    });
    throw new Error('This booking cannot be marked for completion.');
  }
  const booking = result.snapshot.val() as Booking;
  console.log('[BOOKING_COMPLETION] customer notification started', {
    bookingId,
    customerId: booking.customerId,
  });
  try {
    await createNotification(booking.customerId, 'bookingCompleted', 'Completion requested', `${booking.providerSnapshot?.fullName ?? 'Your provider'} requested completion approval.`, bookingId, providerId);
    console.log('[BOOKING_COMPLETION] customer notification completed', { bookingId });
  } catch (error) {
    console.error('[BOOKING_COMPLETION] customer notification failed', { bookingId, error });
    throw error;
  }
  console.log('[BOOKING_COMPLETION] service completed', { bookingId });
}

export async function approveBookingCompletion(bookingId: string): Promise<void> {
  console.log('[COMPLETION_APPROVAL] service started', { bookingId });
  const bookingRef = ref(database, `bookings/${bookingId}`);
  const bookingSnapshot = await get(bookingRef);
  console.log('[COMPLETION_APPROVAL] booking read', {
    bookingId,
    exists: bookingSnapshot.exists(),
    status: bookingSnapshot.child('status').val(),
  });
  if (!bookingSnapshot.exists()) {
    throw new Error('This booking could not be found. Refresh your bookings and try again.');
  }

  let syncedBooking: Booking | null = null;
  await new Promise<void>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined;
    const timeout = setTimeout(() => {
      unsubscribe?.();
      reject(new Error('Unable to sync this booking. Check your connection and try again.'));
    }, 10000);

    unsubscribe = onValue(bookingRef, snapshot => {
      console.log('[COMPLETION_APPROVAL] booking value listener event', {
        bookingId,
        exists: snapshot.exists(),
        status: snapshot.child('status').val(),
      });
      if (!snapshot.exists()) return;
      syncedBooking = snapshot.val() as Booking;
      clearTimeout(timeout);
      unsubscribe?.();
      resolve();
    }, error => {
      clearTimeout(timeout);
      unsubscribe?.();
      console.error('[COMPLETION_APPROVAL] booking value listener failed', { bookingId, error });
      reject(error);
    });
  });

  let transactionAttempt = 0;
  let prefetchedFallbackAvailable = true;
  const result = await runTransaction(bookingRef, current => {
    transactionAttempt += 1;
    let transactionBooking = current as Booking | null;
    let usedFallback = false;
    if (!transactionBooking && prefetchedFallbackAvailable) {
      transactionBooking = syncedBooking ?? bookingSnapshot.val() as Booking;
      prefetchedFallbackAvailable = false;
      usedFallback = true;
      console.warn('[COMPLETION_APPROVAL] transaction using verified listener snapshot', {
        bookingId,
        attempt: transactionAttempt,
        fallbackStatus: transactionBooking.status,
      });
    }
    console.log('[COMPLETION_APPROVAL] transaction callback', {
      bookingId,
      attempt: transactionAttempt,
      currentStatus: transactionBooking?.status,
      usedFallback,
    });
    if (!transactionBooking || transactionBooking.status !== 'completionRequested') {
      console.warn('[COMPLETION_APPROVAL] transaction callback aborting', {
        bookingId,
        attempt: transactionAttempt,
        reason: !transactionBooking ? 'missing-current-data' : 'status-not-completionRequested',
      });
      return;
    }
    const timestamp = now();
    console.log('[COMPLETION_APPROVAL] transaction transition', {
      bookingId,
      from: transactionBooking.status,
      to: 'completed',
    });
    return { ...transactionBooking, status: 'completed', updatedAt: timestamp };
  });
  console.log('[COMPLETION_APPROVAL] transaction result', {
    bookingId,
    committed: result.committed,
    finalStatus: result.snapshot.child('status').val(),
  });
  if (!result.committed) {
    const currentSnapshot = await get(bookingRef);
    const current = currentSnapshot.val() as Booking | null;
    if (current?.status === 'completed') {
      console.log('[COMPLETION_APPROVAL] booking already completed', { bookingId });
      return;
    }
    console.error('[COMPLETION_APPROVAL] transaction not committed', {
      bookingId,
      currentStatus: current?.status ?? result.snapshot.child('status').val(),
    });
    throw new Error(`This booking is not awaiting completion approval (current status: ${current?.status ?? 'missing'}).`);
  }
  const booking = result.snapshot.val() as Booking;
  if (booking.providerId) {
    console.log('[COMPLETION_APPROVAL] provider notification started', {
      bookingId,
      providerId: booking.providerId,
    });
    await createNotification(booking.providerId, 'bookingCompleted', 'Completion approved', `${booking.customerSnapshot.fullName} approved completion of the booking.`, bookingId, booking.customerId);
    console.log('[COMPLETION_APPROVAL] provider notification completed', { bookingId });
  }
  console.log('[COMPLETION_APPROVAL] service completed', { bookingId });
}

export async function getBookings(field: 'customerId' | 'providerId', value: string, status?: BookingStatus): Promise<Booking[]> {
  const bookingQuery = query(ref(database, 'bookings'), orderByChild(field), equalTo(value));
  const bookings = snapshotValues<Booking>(await get(bookingQuery));
  const result = status ? bookings.filter(booking => booking.status === status) : bookings;
  return result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const snapshot = await get(ref(database, `bookings/${bookingId}`));
  if (!snapshot.exists()) {
    return null;
  }
  return { ...(snapshot.val() as object), id: bookingId } as Booking;
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
    if (booking.bookingType === 'open' && status === 'cancelled' && booking.category) {
      await update(ref(database), {
        [`openBookingListings/${booking.category}/${bookingId}`]: null,
      });
    }

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
      if (booking.providerId) {
        await createNotification(booking.providerId, 'bookingCancelled', 'Booking Cancelled', `This booking has been cancelled.`, bookingId, booking.customerId);
      }
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

export async function deleteAccount(uid: string, password: string): Promise<void> {
  if (!uid || !password) {
    throw new Error('Unable to delete account. Please try again.');
  }
  try {
    // 1. Cancel all active bookings for this provider FIRST (while user is still authenticated)
    const activeBookings = await getBookings('providerId', uid);
    const cancellableBookings = activeBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
    await Promise.allSettled(cancellableBookings.map(booking => updateBookingStatus(booking.id, 'cancelled')));

    // 2. Delete all services for this provider (including inactive ones) - while still authenticated
    const services = await getServices({ providerId: uid, activeOnly: false });
    await Promise.allSettled(services.map(service => deleteService(service)));

    // 3. Clean up database entries (users, notifications, fcmTokens, provider booking index)
    // Do this while user is still authenticated
    const bookingIds = cancellableBookings.map(b => b.id);

    // Fetch notification IDs so we can delete them individually — the DB rules
    // only allow writes on notifications/$uid/$notificationId, not the parent node.
    const notifSnapshot = await get(ref(database, `notifications/${uid}`));
    const notificationIds = notifSnapshot.exists() ? Object.keys(notifSnapshot.val() as Record<string, unknown>) : [];

    const updates: Record<string, null> = {
      [`users/${uid}`]: null,
      [`providerPublicProfiles/${uid}`]: null,
      [`fcmTokens/${uid}`]: null,
    };
    notificationIds.forEach(id => {
      updates[`notifications/${uid}/${id}`] = null;
    });
    bookingIds.forEach(id => {
      updates[`providerBookingIndex/${uid}/${id}`] = null;
    });
    await update(ref(database), updates);

    // 4. Re-authenticate the user (required by Firebase for sensitive operations)
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === uid) {
      const email = currentUser.email;
      if (!email) {
        throw new Error('Unable to delete account. Please try again.');
      }
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // 5. Delete the Firebase Auth user LAST
      await currentUser.delete();
    }
  } catch (error: any) {
    console.error('[DB] deleteAccount FAILED', {
      uid,
      code: error?.code,
      message: error?.message,
      fullError: error,
    });
    throw new Error(`Unable to delete account: ${error?.code ?? error?.message ?? 'Unknown error'}`);
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
