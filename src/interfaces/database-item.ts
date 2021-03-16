export interface DataBaseItem {
  id: string;
  website: string;
  address?: string;
  city?: string;
  postalCode?: string;
  longitude?: string;
  latitude?: string;
  hasFurniture?: boolean;
  roomCount?: number;
  yearBuilt?: number[];
  price?: number;
  priceExcludingCharges?: number;
  surface?: number;
  maxPrice?: number;
  isLegal?: boolean;
  renter?: string;
  createdAt?: string;
  stations?: string[];
  save: () => void;
}
