/**
 * @format
 */

import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { showBookingNotification } from './src/services/localNotifications';

// Background/terminated message handler — must be registered at the top level,
// outside of any React component (React Native Firebase requirement).
//
// IMPORTANT (platform behavior): this handler only fires for DATA-ONLY
// messages while the app is backgrounded. Regular `notification` messages
// (what the Cloud Functions send) are displayed by the Android system tray
// directly WITHOUT waking the JS — for those, watch the device logcat
// instead of React Native console logs.
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('[Push] RECEIVED (app in BACKGROUND):', {
    messageId: remoteMessage?.messageId,
    title: remoteMessage?.notification?.title,
    data: remoteMessage?.data,
  });
  // Safety net: display a local notification for data-only booking messages
  // (system-displayed `notification` messages never reach this handler).
  const data = remoteMessage?.data;
  if (data?.bookingId && data?.type) {
    await showBookingNotification(
      remoteMessage?.notification?.title ?? String(data.type),
      remoteMessage?.notification?.body ?? 'New notification',
      String(data.bookingId),
    );
  }
});

console.log('[Push] background message handler registered');

AppRegistry.registerComponent(appName, () => App);
