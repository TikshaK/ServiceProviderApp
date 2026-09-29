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
import { ref, onValue, getDatabase } from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import { Booking } from '../types/booking';
import { showToast } from '../utils';
import { useAuth } from './useAuth';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Track the previous status of each booking to detect actual changes (not initial load). */
const previousBookingStatuses = new Map<string, string>;

/** Flag to track if this is the initial data load. */
let isInitialLoad = true;

/** Track bookings that need new-booking notifications. */
const newBookingNotifications = new Map<string, boolean>();

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
 *  5. Database listener -> listens to bookings node for status changes and
 *                   shows local notifications when a booking is accepted/declined/completed/cancelled.
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

  // 5. Listen to bookings node for status changes and show local notifications.
  // This replaces the need for Cloud Functions.
  useEffect(() => {
    if (!uid) {
      previousBookingStatuses.clear();
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

        if (isInitialLoad) {
          // First load — record all existing statuses, don't show notifications.
          if (isFinalStatus) {
            previousBookingStatuses.set(bookingId, currentStatus);
          }
          // Track pending bookings so they don't trigger new notifications on reload
          if (currentStatus === 'pending') {
            previousBookingStatuses.set(bookingId, currentStatus);
            newBookingNotifications.set(bookingId, true);
          }
          return;
        }

        // On subsequent updates: notify when status transitions to a final state.
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
            showBookingNotification(title, body, bookingId);
          }
        }

        // NEW: Send notification when a pending booking is newly created (customer booked)
        if (currentStatus === 'pending' && isProviderBooking && !previousStatus) {
          // This is a new pending booking - notify the provider
          previousBookingStatuses.set(bookingId, currentStatus);

          showBookingNotification(
            'New Booking Received',
            `${b.customerSnapshot?.fullName ?? 'Customer'} booked a service for you.`,
            bookingId
          );
          // Remove from tracking so it doesn't notify again
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

        let booking: Booking | null = null;
        if (pendingTap.bookingId) {
          booking = await getBooking(pendingTap.bookingId);
        }

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
