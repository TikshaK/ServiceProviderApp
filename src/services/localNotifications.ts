import notifee from '@notifee/react-native';

/**
 * Initialize local notifications — creates the Android notification channel.
 * Call this once when the app starts (e.g. in App.tsx).
 */
export async function initLocalNotifications(): Promise<void> {
  try {
    await notifee.createChannel({
      id: 'booking',
      name: 'Booking Notifications',
      importance: 4,
      vibration: true,
      lights: true,
    });
    console.log('[LocalNotif] channel created');
  } catch (error) {
    console.log('[LocalNotif] channel creation failed:', error);
  }
}

/**
 * Display a booking status notification in the device tray.
 * Uses a string ID as required by Notifee v9.
 */
export async function showBookingNotification(
  title: string,
  body: string,
  bookingId: string,
): Promise<void> {
  try {
    await notifee.displayNotification({
      id: `${bookingId}`,
      title,
      body,
      data: { bookingId },
      android: {
        channelId: 'booking',
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'default',
      },
    });
    console.log('[LocalNotif] notification shown:', bookingId);
  } catch (error) {
    console.log('[LocalNotif] display failed:', error);
  }
}

/**
 * Clear all notifications (useful on sign-out).
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await notifee.cancelAllNotifications();
  } catch (error) {
    console.log('[LocalNotif] cancelAll failed:', error);
  }
}
