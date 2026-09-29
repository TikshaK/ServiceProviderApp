/**
 * Booking push notifications.
 *
 * Triggered by writes to the Realtime Database `bookings` node — the React
 * Native app only ever writes bookings; it never sends pushes itself.
 * See firebase_notifications_react_native_implementation.md (sections 17, 22-26).
 *
 * Flow:
 *   Customer creates booking        -> newBooking            -> push to provider
 *   Provider accepts                -> bookingStatusChanged  -> push to customer
 *   Booking declined / completed    -> bookingStatusChanged  -> push to customer
 *   Either party cancels            -> bookingStatusChanged  -> push to both parties
 */
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';
import { onValueCreated, onValueUpdated } from 'firebase-functions/v2/database';
import { logger } from 'firebase-functions/v2';

initializeApp();

/** FCM errors after which the token is dead and must be deleted. */
const INVALID_TOKEN_ERRORS = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

interface TokenEntry {
  token?: string;
  platform?: string;
  updatedAt?: number;
}

interface BookingSnapshot {
  customerId?: string;
  providerId?: string;
  status?: string;
  customerSnapshot?: { fullName?: string };
  providerSnapshot?: { fullName?: string };
  serviceSnapshot?: { title?: string };
}

/** Read every valid FCM token registered for a user (supports multiple devices). */
async function getRecipientTokens(uid?: string | null): Promise<string[]> {
  if (!uid) {
    return [];
  }

  const snapshot = await getDatabase().ref(`fcmTokens/${uid}`).get();
  const value = snapshot.val() as Record<string, TokenEntry | string | null> | null;
  if (!value) {
    return [];
  }

  const tokens = Object.values(value)
    .map(entry => (typeof entry === 'string' ? entry : entry?.token))
    .filter((token): token is string => typeof token === 'string' && token.length > 0);

  return [...new Set(tokens)];
}

/** Delete tokens FCM reports as invalid so they stop being sent to. */
async function removeInvalidTokens(uid: string, invalidTokens: string[]): Promise<void> {
  const snapshot = await getDatabase().ref(`fcmTokens/${uid}`).get();
  const value = snapshot.val() as Record<string, TokenEntry | string | null> | null;
  if (!value) {
    return;
  }

  const updates: Record<string, null> = {};
  for (const [key, entry] of Object.entries(value)) {
    const token = typeof entry === 'string' ? entry : entry?.token;
    if (token && invalidTokens.includes(token)) {
      updates[key] = null;
    }
  }

  if (Object.keys(updates).length > 0) {
    await getDatabase().ref(`fcmTokens/${uid}`).update(updates);
    logger.info('Removed invalid FCM tokens', { uid, count: Object.keys(updates).length });
  }
}

/** Send a push notification to every device registered for `uid`. */
async function sendToUser(
  uid: string | undefined | null,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<void> {
  if (!uid) {
    logger.warn('sendToUser called without a recipient uid', { title });
    return;
  }

  const tokens = await getRecipientTokens(uid);
  if (tokens.length === 0) {
    logger.info('No FCM tokens registered — skipping push', { uid, title });
    return;
  }

  const response = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data,
    // No android.notification.channelId: the FCM Android SDK then falls back
    // to its built-in default channel ("Miscellaneous"), which it creates on
    // demand — the app does not define channels itself.
  });

  const invalidTokens: string[] = [];
  response.responses.forEach((result, index) => {
    if (result.error && INVALID_TOKEN_ERRORS.has(result.error.code)) {
      invalidTokens.push(tokens[index]);
    }
  });

  if (invalidTokens.length > 0) {
    await removeInvalidTokens(uid, invalidTokens);
  }

  logger.info('Push notification sent', {
    uid,
    title,
    successCount: response.successCount,
    failureCount: response.failureCount,
  });
}

/**
 * A booking was created (customer tapped "Book This Service").
 * -> notify the provider.
 */
export const newBooking = onValueCreated('/bookings/{bookingId}', async event => {
  const booking = event.data.val() as BookingSnapshot | null;
  if (!booking) {
    return;
  }

  const customerName = booking.customerSnapshot?.fullName ?? 'A customer';
  const serviceTitle = booking.serviceSnapshot?.title ?? 'a service';

  logger.info('newBooking triggered', {
    bookingId: event.params.bookingId,
    providerId: booking.providerId,
  });

  await sendToUser(
    booking.providerId,
    'New Booking',
    `${customerName} requested ${serviceTitle}.`,
    {
      type: 'NEW_BOOKING',
      bookingId: event.params.bookingId,
    },
  );
});

/**
 * A booking's status changed (accepted / declined / completed / cancelled).
 * -> notify the other party.
 *
 * The `before.status !== after.status` guard is essential: it stops later
 * writes to the same booking (e.g. updatedAt changing) from re-sending a push.
 */
export const bookingStatusChanged = onValueUpdated('/bookings/{bookingId}', async event => {
  const before = event.data.before.val() as BookingSnapshot | null;
  const after = event.data.after.val() as BookingSnapshot | null;

  if (!before || !after) {
    // Creation is handled by newBooking.
    return;
  }

  if (before.status === after.status) {
    // Duplicate guard — only real status transitions notify.
    return;
  }

  const bookingId = event.params.bookingId;
  const providerName = after.providerSnapshot?.fullName ?? 'Your provider';
  const serviceTitle = after.serviceSnapshot?.title ?? 'your booking';

  logger.info('bookingStatusChanged triggered', {
    bookingId,
    from: before.status,
    to: after.status,
  });

  switch (after.status) {
    case 'accepted':
      await sendToUser(after.customerId, 'Booking Accepted', `${providerName} accepted your booking.`, {
        type: 'BOOKING_ACCEPTED',
        bookingId,
      });
      break;

    case 'declined':
      await sendToUser(after.customerId, 'Booking Declined', `${providerName} declined your booking.`, {
        type: 'BOOKING_DECLINED',
        bookingId,
      });
      break;

    case 'completed':
      await sendToUser(after.customerId, 'Booking Completed', `${providerName} has completed ${serviceTitle}.`, {
        type: 'BOOKING_COMPLETED',
        bookingId,
      });
      break;

    case 'cancelled':
      // The app does not record who cancelled — notify both parties,
      // matching the in-app behaviour of updateBookingStatus().
      await Promise.all([
        sendToUser(after.customerId, 'Booking Cancelled', `Your booking for ${serviceTitle} has been cancelled.`, {
          type: 'BOOKING_CANCELLED',
          bookingId,
        }),
        sendToUser(after.providerId, 'Booking Cancelled', `The booking for ${serviceTitle} has been cancelled.`, {
          type: 'BOOKING_CANCELLED',
          bookingId,
        }),
      ]);
      break;

    default:
      // pending / inProgress — no push needed.
      break;
  }
});
