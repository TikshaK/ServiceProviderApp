// Push notification (FCM) service — add-on to the existing Firebase setup.
//
// Responsibilities (see firebase_notifications_react_native_implementation.md):
//  - request notification permission (iOS + Android 13+ POST_NOTIFICATIONS)
//  - fetch / save / remove this device's FCM token under fcmTokens/{uid}
//  - register foreground, token-refresh and notification-tap listeners
//
// NOTE: Cloud Functions have been replaced by local notifications.
// The app now listens to the 'bookings' node in Realtime Database
// via onValue() and shows local notifications using @notifee/react-native
// when a booking status changes (accepted/declined/completed/cancelled).
// This avoids the need for Firebase Cloud Functions (which require Blaze plan).
//
// NOTE: @react-native-firebase/messaging v26 uses the modular API — there is
// no default `messaging()` export and no createChannel() helper.
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import {
  get as firebaseGet,
  getDatabase,
  push,
  ref,
  set as firebaseSet,
  update as firebaseUpdate,
} from '@react-native-firebase/database';
import { getApp } from '@react-native-firebase/app';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { baseApi } from '../baseApi';

// NOTE: Background/terminated FCM messages are handled in index.js —
// RN Firebase v26 requires setBackgroundMessageHandler(messaging, handler)
// to be registered at the top level of index.js, before AppRegistry.

/** Payload `type` values shared with the Cloud Functions in /functions. */
export const PUSH_NOTIFICATION_TYPE = {
  NEW_BOOKING: 'NEW_BOOKING',
  BOOKING_ACCEPTED: 'BOOKING_ACCEPTED',
  BOOKING_DECLINED: 'BOOKING_DECLINED',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
} as const;

export type PushNotificationType =
  (typeof PUSH_NOTIFICATION_TYPE)[keyof typeof PUSH_NOTIFICATION_TYPE];

/** Data carried by a tapped notification — used to navigate after a tap. */
export interface NotificationTap {
  type?: string;
  bookingId?: string;
}

const messaging = getMessaging(getApp());
const database = getDatabase(getApp());
const get = (...args: Parameters<typeof firebaseGet>) => baseApi(() => firebaseGet(...args));
const set = (...args: Parameters<typeof firebaseSet>) => baseApi(() => firebaseSet(...args));
const update = (...args: Parameters<typeof firebaseUpdate>) => baseApi(() => firebaseUpdate(...args));

type TokenEntry = { token?: string; platform?: string; updatedAt?: number };
type TokenMap = Record<string, TokenEntry | string | null>;

const entryToken = (entry: TokenEntry | string | null | undefined): string | null => {
  if (typeof entry === 'string') {
    return entry;
  }
  return typeof entry?.token === 'string' ? entry.token : null;
};

/**
 * Ask the OS for notification permission.
 *  - Android 13+ (API 33): runtime POST_NOTIFICATIONS permission
 *  - iOS: requestPermission() (provisional counts as granted)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if ((Platform.Version as number) >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      // Pre-13 Android grants notification permission at install time.
      return true;
    }

    const status = await requestPermission(messaging);
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.log('[Push] requestNotificationPermission FAILED:', error);
    return false;
  }
}

/** Fetch this device's FCM registration token (null when unavailable). */
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await baseApi(() => getToken(messaging));
    return token || null;
  } catch (error) {
    console.log('[Push] getFCMToken FAILED:', error);
    return null;
  }
}

/**
 * Register this device's token under fcmTokens/{uid}.
 *
 * Structure (supports multiple devices per user, deduped so repeated app
 * launches never create duplicate entries):
 *
 *   fcmTokens
 *     {uid}
 *       {pushId}: { token, platform, updatedAt }
 */
export async function saveFCMToken(uid: string): Promise<string | null> {
  if (!uid) {
    return null;
  }
  try {
    const allowed = await requestNotificationPermission();
    if (!allowed) {
      console.log('[Push] notification permission denied — token not saved');
      return null;
    }

    const token = await getFCMToken();
    if (!token) {
      console.log('[Push] no FCM token available yet — will retry on next foreground');
      return null;
    }
    // The token is generated by Google's FCM servers for THIS device + THIS
    // app install — visible here for testing (Firebase Console → Cloud
    // Messaging → Send test message).
    console.log('[Push] FCM token for this device:', token);

    const snapshot = await get(ref(database, `fcmTokens/${uid}`));
    const entries = (snapshot.val() ?? {}) as TokenMap;

    const alreadySaved = Object.values(entries).some(
      entry => entryToken(entry) === token,
    );
    if (alreadySaved) {
      return token;
    }

    const entryRef = push(ref(database, `fcmTokens/${uid}`));
    await set(entryRef, {
      token,
      platform: Platform.OS,
      updatedAt: Date.now(),
    });
    console.log('[Push] FCM token saved for uid:', uid, '| token:', token);
    return token;
  } catch (error) {
    console.log('[Push] saveFCMToken FAILED:', error);
    return null;
  }
}

/** Remove this device's token (called on sign-out so the device stops receiving pushes). */
export async function removeFCMToken(uid: string): Promise<void> {
  if (!uid) {
    return;
  }
  try {
    const token = await getFCMToken();
    if (!token) {
      return;
    }

    const snapshot = await get(ref(database, `fcmTokens/${uid}`));
    const entries = (snapshot.val() ?? {}) as TokenMap;

    const updates: Record<string, null> = {};
    Object.entries(entries).forEach(([key, entry]) => {
      if (entryToken(entry) === token) {
        updates[key] = null;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(database, `fcmTokens/${uid}`), updates);
      console.log('[Push] FCM token removed for uid:', uid);
    }
  } catch (error) {
    console.log('[Push] removeFCMToken FAILED:', error);
  }
}

/**
 * Foreground messages (app open) are not displayed by the OS — surface them
 * through a callback so the UI can show them (toast / in-app list already
 * updates live through subscribeToNotifications).
 */
export function setupForegroundListener(
  onForegroundMessage: (title?: string, body?: string) => void,
): () => void {
  return onMessage(messaging, remoteMessage => {
    console.log('[Push] RECEIVED (app in FOREGROUND):', {
      messageId: remoteMessage?.messageId,
      sentTime: remoteMessage?.sentTime,
      title: remoteMessage?.notification?.title,
      body: remoteMessage?.notification?.body,
      data: remoteMessage?.data,
    });
    onForegroundMessage(
      remoteMessage?.notification?.title,
      remoteMessage?.notification?.body,
    );
  });
}

/** FCM tokens can rotate at any time — re-save when that happens. */
export function setupTokenRefreshListener(onRefresh: () => void): () => void {
  return onTokenRefresh(messaging, () => {
    console.log('[Push] FCM token refreshed');
    onRefresh();
  });
}

/** Notification tapped while the app was in the background or foreground. */
export function setupNotificationTapListener(
  onTap: (tap: NotificationTap) => void,
): () => void {
  const unsubscribeFcm = onNotificationOpenedApp(messaging, remoteMessage => {
    console.log('[Push] NOTIFICATION TAPPED (FCM background):', {
      messageId: remoteMessage?.messageId,
      title: remoteMessage?.notification?.title,
      data: remoteMessage?.data,
    });
    const data = remoteMessage?.data;
    if (!data) {
      return;
    }
    onTap({
      type: typeof data.type === 'string' ? data.type : undefined,
      bookingId: typeof data.bookingId === 'string' ? data.bookingId : undefined,
    });
  });

  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification?.data?.bookingId) {
      console.log('[Push] NOTIFICATION TAPPED (Notifee foreground):', detail.notification.data);
      onTap({
        bookingId: String(detail.notification.data.bookingId),
        type: typeof detail.notification.data.type === 'string' ? detail.notification.data.type : undefined,
      });
    }
  });

  return () => {
    unsubscribeFcm();
    unsubscribeNotifee();
  };
}

/** Notification that opened the app from a fully-quit state (cold start). */
export async function getInitialNotificationTap(): Promise<NotificationTap | null> {
  try {
    const remoteMessage = await getInitialNotification(messaging);
    const data = remoteMessage?.data;
    if (data && (data.bookingId || data.type)) {
      console.log('[Push] NOTIFICATION TAPPED (COLD START — FCM):', {
        messageId: remoteMessage?.messageId,
        title: remoteMessage?.notification?.title,
        data,
      });
      return {
        type: typeof data.type === 'string' ? data.type : undefined,
        bookingId: typeof data.bookingId === 'string' ? data.bookingId : undefined,
      };
    }

    const notifeeInitial = await notifee.getInitialNotification();
    if (notifeeInitial?.notification?.data?.bookingId) {
      console.log('[Push] NOTIFICATION TAPPED (COLD START — Notifee):', notifeeInitial.notification.data);
      return {
        bookingId: String(notifeeInitial.notification.data.bookingId),
        type: typeof notifeeInitial.notification.data.type === 'string' ? notifeeInitial.notification.data.type : undefined,
      };
    }

    return null;
  } catch (error) {
    console.log('[Push] getInitialNotification FAILED:', error);
    return null;
  }
}
