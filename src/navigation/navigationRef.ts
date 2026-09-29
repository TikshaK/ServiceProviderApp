import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * App-wide navigation ref so push-notification taps can navigate
 * from outside the React tree (see src/hooks/usePushNotifications.ts).
 * Attached to <NavigationContainer ref={navigationRef}> in App.tsx.
 */
export const navigationRef = createNavigationContainerRef<any>();
