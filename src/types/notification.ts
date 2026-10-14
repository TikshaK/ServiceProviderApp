export type NotificationType = 'bookingCreated' | 'bookingAccepted' | 'bookingDeclined' | 'bookingCancelled' | 'bookingCompleted' | 'bookingCompletionRejected' | 'quoteReceived' | 'quoteAccepted' | 'quoteRejected' | 'newReview';

export interface AppNotification {
  id: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  body: string;
  bookingId?: string;
  isRead: boolean;
  createdAt: number;
}
