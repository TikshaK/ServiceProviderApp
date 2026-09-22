export interface ServiceImage {
  uri: string;
  publicId?: string;
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  currency: string;
  imageUrls: string[];
  isActive: boolean;
  ratingAverage: number;
  reviewCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateServicePayload {
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  currency?: string;
  imageUrls?: string[];
  isActive?: boolean;
}
