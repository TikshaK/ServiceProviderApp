export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'customer' | 'provider';
  rating: number;
  compliments: string[];
  comment: string;
  createdAt: number;
}
