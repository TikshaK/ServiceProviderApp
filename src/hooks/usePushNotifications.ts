import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { navigationStrings } from '../constants';
import { navigationRef } from '../navigation/navigationRef';
import { getBooking } from '../services/firebase';
import {
  getInitialNotificationTap,
  saveFCMToken,
  setupForegroundListener,
  setupNotificationTapListener,
  setupTokenRefreshListener,
  type NotificationTap,
} from '../services/notifications';
import { showBookingNotification } from '../services/localNotifications';
import { ref, onValue as firebaseOnValue, getDatabase } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import { subscribeWhenOnline } from '../services/baseApi';
import { Booking } from '../types/booking';
import { showToast } from '../utils';
import { useAuth } from './useAuth';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function onValue(
  queryRef: Parameters<typeof firebaseOnValue>[0],
  callback: Parameters<typeof firebaseOnValue>[1],
  cancelCallback?: Parameters<typeof firebaseOnValue>[2],
  options?: Parameters<typeof firebaseOnValue>[3],
) {
  return subscribeWhenOnline(() => {
    if (cancelCallback && options) {
      return firebaseOnValue(queryRef, callback, cancelCallback, options);
    }
    if (cancelCallback) {
      return firebaseOnValue(queryRef, callback, cancelCallback);
    }
    return firebaseOnValue(queryRef, callback);
  });
}

/** Track the previous status of each booking to detect actual changes (not initial load). */
const previousBookingStatuses = new Map<string, string>();

/** Track known quote IDs per booking to detect newly submitted quotes. */
const previousBookingQuotes = new Map<string, Set<string>>();

/** Track known notification IDs under notifications/${uid}. */
const seenNotificationIds = new Set<string>();

/** Flag to track if this is the initial bookings data load. */
let isInitialLoad = true;

/** Flag to track if this is the initial user notifications data load. */
let isInitialNotificationsLoad = true;

/** Track bookings that need new-booking notifications. */
const newBookingNotifications = new Map<string, boolean>();

/** Deduplication map to prevent repeated notifications for the same event within 5s. */
const recentlyNotified = new Map<string, number>();

function notifyUser(title: string, body: string, bookingId?: string) {
  const key = `${bookingId || ''}_${title}_${body}`;
  const now = Date.now();
  const lastTime = recentlyNotified.get(key) || 0;
  if (now - lastTime < 5000) {
    return;
  }
  recentlyNotified.set(key, now);

  if (bookingId) {
    showBookingNotification(title, body, bookingId);
  }
  showToast({
    type: 'info',
    title,
    message: body,
  });
}

function formatBookingForDetails(rawBooking: any): any {
  if (!rawBooking) return null;
  const rawQuotes = rawBooking.quotes;
  const quotesArray: any[] = Array.isArray(rawQuotes)
    ? rawQuotes
    : rawQuotes && typeof rawQuotes === 'object'
    ? Object.values(rawQuotes)
    : [];

  const hasPendingQuote = quotesArray.some(quote => quote?.status === 'pending');

  let formattedStatus = rawBooking.status;
  if (rawBooking.status === 'completed') formattedStatus = 'Completed';
  else if (rawBooking.status === 'completionRequested') formattedStatus = 'Completion requested';
  else if (rawBooking.status === 'quotePending' || hasPendingQuote) formattedStatus = 'Quote pending';
  else if (rawBooking.status === 'accepted' || rawBooking.status === 'inProgress') formattedStatus = 'Accepted';
  else if (rawBooking.status === 'cancelled' || rawBooking.status === 'declined') formattedStatus = 'Cancelled';
  else if (rawBooking.status === 'pending') formattedStatus = hasPendingQuote ? 'Quote pending' : 'Pending';

  return {
    id: rawBooking.id,
    date: rawBooking.date ?? (rawBooking.scheduledDate ? `${rawBooking.scheduledDate} • ${rawBooking.scheduledTime}` : 'Date pending'),
    status: formattedStatus ?? 'Pending',
    title: rawBooking.title ?? rawBooking.serviceSnapshot?.title ?? 'Service Request',
    provider: rawBooking.provider ?? rawBooking.providerSnapshot?.serviceName ?? rawBooking.providerSnapshot?.fullName ?? 'Waiting for quotes',
    specialist: rawBooking.specialist ?? rawBooking.providerSnapshot?.fullName ?? 'Not assigned',
    location: rawBooking.location ?? rawBooking.addressSnapshot?.street ?? 'Location pending',
    price: rawBooking.price ?? (rawBooking.bookingType === 'open' && rawBooking.status === 'pending' && !rawBooking.quotedAmount
      ? 'Awaiting quote'
      : `$${rawBooking.quotedAmount ?? rawBooking.baseAmount ?? 0}`),
    image: rawBooking.image ?? rawBooking.serviceSnapshot?.imageUrls?.[0] ?? '',
    providerId: rawBooking.providerId ?? undefined,
    bookingType: rawBooking.bookingType,
    category: rawBooking.category,
    quoteAmount: rawBooking.quoteAmount ?? rawBooking.quotedAmount,
    totalAmount: rawBooking.totalAmount,
    platformFee: rawBooking.platformFee,
    quotes: quotesArray,
    serviceSnapshot: rawBooking.serviceSnapshot,
    customerSnapshot: rawBooking.customerSnapshot,
    providerSnapshot: rawBooking.providerSnapshot,
    addressSnapshot: rawBooking.addressSnapshot,
  };
}

/**
 * Push-notification lifecycle (add-on — the existing in-app notification
 * screens keep working exactly as before):
 *
 *  1. Signed in  -> create Android channel, request permission, save FCM token.
 *  2. Always     -> foreground messages surfaced as a toast (the in-app list
 *                   already updates live via subscribeToNotifications).
 *  3. Token rotates -> re-save the token for the current user.
 *  4. Notification tapped -> fetch the booking and open the right
 *                   BookingDetails screen for the user's role, waiting until
 *                   navigation is ready and the session is hydrated.
 *  5. Database listener -> listens to bookings node for status changes and quotes,
 *                   and notifications/${uid} for newly arrived notifications,
 *                   and shows local notifications and in-app toasts.
 *
 * Local notifications are handled entirely in the app — no Cloud Functions needed.
 */
export function usePushNotifications() {
  const { uid, isAuthenticated, isLoading, isHydrating, role } = useAuth();
  const [pendingTap, setPendingTap] = useState<NotificationTap | null>(null);
  const db = getDatabase(getApp());

  // 1. Register this device whenever a user is signed in — and retry whenever
  // the app returns to the foreground, so a permission/rule failure heals
  // itself without needing an app restart.
  useEffect(() => {
    if (!uid) {
      return;
    }
    saveFCMToken(uid);

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        saveFCMToken(uid);
      }
    });

    return () => subscription.remove();
  }, [uid]);

  // 2 + 3. Listeners registered once for the lifetime of the app.
  useEffect(() => {
    const unsubscribers = [
      setupForegroundListener((title, body) => {
        if (!title && !body) {
          return;
        }
        showToast({
          type: 'info',
          title: title ?? 'Notification',
          message: body ?? '',
        });
      }),
      setupTokenRefreshListener(() => {
        if (uid) {
          saveFCMToken(uid);
        }
      }),
      setupNotificationTapListener(setPendingTap),
    ];

    let cancelled = false;
    getInitialNotificationTap().then(tap => {
      if (tap && !cancelled) {
        setPendingTap(tap);
      }
    });

    return () => {
      cancelled = true;
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [uid]);

  // 5a. Listen to bookings node for status changes & quotes, and show notifications.
  useEffect(() => {
    if (!uid) {
      previousBookingStatuses.clear();
      previousBookingQuotes.clear();
      isInitialLoad = true;
      return;
    }

    const bookingRef = ref(db, 'bookings');

    const unsubscribe = onValue(bookingRef, (snapshot) => {
      const bookings = snapshot.val() as Record<string, any> | null;
      if (!bookings) return;

      Object.entries(bookings).forEach(([bookingId, booking]) => {
        const b = booking as any;
        const currentStatus = b.status;
        const isFinalStatus = ['accepted', 'declined', 'completed', 'cancelled'].includes(currentStatus);
        const isProviderBooking = b.providerId === uid;
        const isCustomerBooking = b.customerId === uid;
        const previousStatus = previousBookingStatuses.get(bookingId);

        const rawQuotes = b.quotes;
        const currentQuoteIds = new Set<string>(
          rawQuotes && typeof rawQuotes === 'object' ? Object.keys(rawQuotes) : []
        );
        const previousQuoteIds = previousBookingQuotes.get(bookingId);

        if (isInitialLoad) {
          // First load — record all existing statuses and quotes, don't trigger alerts
          if (isFinalStatus) {
            previousBookingStatuses.set(bookingId, currentStatus);
          }
          if (currentStatus === 'pending') {
            previousBookingStatuses.set(bookingId, currentStatus);
            newBookingNotifications.set(bookingId, true);
          }
          previousBookingQuotes.set(bookingId, currentQuoteIds);
          return;
        }

        // Detect new quotes submitted for customer bookings
        if (isCustomerBooking && rawQuotes) {
          if (previousQuoteIds) {
            Object.entries(rawQuotes).forEach(([quoteId, quote]: [string, any]) => {
              if (!previousQuoteIds.has(quoteId) && quote?.status !== 'rejected') {
                const providerName = quote?.providerSnapshot?.fullName ?? 'A service provider';
                const amountStr = typeof quote?.amount === 'number' ? ` of $${quote.amount.toFixed(2)}` : '';
                const serviceTitle = b.serviceSnapshot?.title ? ` for ${b.serviceSnapshot.title}` : '';
                notifyUser(
                  'New Quote Received',
                  `${providerName} sent a quote${amountStr}${serviceTitle}.`,
                  bookingId,
                );
              }
            });
          }
          previousBookingQuotes.set(bookingId, currentQuoteIds);
        }

        // Provider: status transitions to a final state
        if (isFinalStatus && isProviderBooking && currentStatus !== previousStatus) {
          previousBookingStatuses.set(bookingId, currentStatus);

          let title = '';
          let body = '';

          switch (currentStatus) {
            case 'accepted':
              title = 'Booking Accepted';
              body = `${b.providerSnapshot?.fullName ?? 'Provider'} accepted your booking.`;
              break;
            case 'declined':
              title = 'Booking Declined';
              body = `${b.providerSnapshot?.fullName ?? 'Provider'} declined your booking.`;
              break;
            case 'completed':
              title = 'Booking Completed';
              body = `${b.providerSnapshot?.fullName ?? 'Provider'} has completed ${b.serviceSnapshot?.title ?? 'your booking'}.`;
              break;
            case 'cancelled':
              title = 'Booking Cancelled';
              body = `Your booking for ${b.serviceSnapshot?.title ?? 'booking'} has been cancelled.`;
              break;
          }

          if (title && body) {
            notifyUser(title, body, bookingId);
          }
        }

        // Customer: status transitions to a final state
        if (isFinalStatus && isCustomerBooking && currentStatus !== previousStatus) {
          previousBookingStatuses.set(bookingId, currentStatus);

          let title = '';
          let body = '';

          switch (currentStatus) {
            case 'accepted':
              title = 'Booking Accepted';
              body = `Your booking for ${b.serviceSnapshot?.title ?? 'service'} has been accepted.`;
              break;
            case 'declined':
              title = 'Booking Declined';
              body = `Your booking for ${b.serviceSnapshot?.title ?? 'service'} was declined.`;
              break;
            case 'completed':
              title = 'Booking Completed';
              body = `Your booking for ${b.serviceSnapshot?.title ?? 'service'} has been completed.`;
              break;
            case 'cancelled':
              title = 'Booking Cancelled';
              body = `Your booking for ${b.serviceSnapshot?.title ?? 'service'} has been cancelled.`;
              break;
          }

          if (title && body) {
            notifyUser(title, body, bookingId);
          }
        }

        // Provider: new pending booking created by customer
        if (currentStatus === 'pending' && isProviderBooking && !previousStatus) {
          previousBookingStatuses.set(bookingId, currentStatus);

          notifyUser(
            'New Booking Received',
            `${b.customerSnapshot?.fullName ?? 'Customer'} booked a service for you.`,
            bookingId,
          );
          newBookingNotifications.delete(bookingId);
        }
      });

      // After first callback, mark initial load as complete.
      if (isInitialLoad) {
        isInitialLoad = false;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [uid, db]);

  // 5b. Listen to user notifications node (notifications/${uid}) in Realtime Database.
  useEffect(() => {
    if (!uid) {
      seenNotificationIds.clear();
      isInitialNotificationsLoad = true;
      return;
    }

    isInitialNotificationsLoad = true;
    const userNotifRef = ref(db, `notifications/${uid}`);

    const unsubscribe = onValue(userNotifRef, (snapshot) => {
      const data = snapshot.val() as Record<string, any> | null;
      if (!data) return;

      if (isInitialNotificationsLoad) {
        Object.keys(data).forEach(id => seenNotificationIds.add(id));
        isInitialNotificationsLoad = false;
        return;
      }

      Object.entries(data).forEach(([id, item]) => {
        if (!seenNotificationIds.has(id)) {
          seenNotificationIds.add(id);
          const title = item.title ?? 'New Notification';
          const body = item.body ?? '';
          const bookingId = item.bookingId;
          notifyUser(title, body, bookingId);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [uid, db]);

  // 6. Open the booking behind a tapped notification once the app can navigate.
  useEffect(() => {
    if (!pendingTap || !isAuthenticated || isLoading || isHydrating || !role) {
      return;
    }

    let active = true;

    (async () => {
      for (let attempt = 0; attempt < 50 && !navigationRef.isReady(); attempt++) {
        await delay(200);
      }
      if (!active || !navigationRef.isReady()) {
        return;
      }

      try {
        const isCustomer = role === 'customer';
        const stack = isCustomer
          ? navigationStrings.CUSTOMER_BOOKINGS_STACK
          : navigationStrings.PROVIDER_BOOKINGS_STACK;
        const listScreen = isCustomer
          ? navigationStrings.CUSTOMER_BOOKINGS
          : navigationStrings.PROVIDER_BOOKINGS;
        const detailScreen = isCustomer
          ? navigationStrings.CUSTOMER_BOOKING_DETAILS
          : navigationStrings.PROVIDER_BOOKING_DETAILS;

        let rawBooking: any = null;
        if (pendingTap.bookingId) {
          rawBooking = await getBooking(pendingTap.bookingId);
        }
        const booking = formatBookingForDetails(rawBooking);

        navigationRef.navigate(
          stack,
          booking
            ? { screen: detailScreen, params: { booking } }
            : { screen: listScreen },
        );
      } catch (error) {
        console.log('[Push] notification navigation FAILED:', error);
      } finally {
        if (active) {
          setPendingTap(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [pendingTap, isAuthenticated, isLoading, isHydrating, role]);
}
