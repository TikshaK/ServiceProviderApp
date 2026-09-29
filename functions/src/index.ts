/**
 * Cloud Functions entry point.
 *
 * Deploy with:   firebase deploy --only functions
 * Watch logs:    firebase functions:log
 */
export { newBooking, bookingStatusChanged } from './notifications/bookingNotifications';
