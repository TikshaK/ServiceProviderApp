export interface CustomerAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}
