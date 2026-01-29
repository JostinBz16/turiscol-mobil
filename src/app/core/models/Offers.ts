export enum OfferType {
  ACCOMMODATION = 'ACCOMMODATION',
  EVENT = 'EVENT',
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

export interface Offer {
  id: string;
  type: OfferType;
  title: string;
  description: string;
  images: string[];
  cityId: number;
  rating: number;
  categoryId: number;
  basePrice: number;
  active: boolean;
}

// --- alojamiento ---
export interface Rules {
  allowChildren: boolean;
  allowPets: boolean;
  pricing: {
    adult: number;
    child: number;
    pet?: number;
  };
}

export interface AccommodationOffer extends Offer {
  type: OfferType.ACCOMMODATION | OfferType.SERVICE;
  maxGuests: number;
  guestRules: Rules;
}

export interface EventOffer extends Offer {
  type: OfferType.EVENT;
  eventDate: string;
  capacity: number;
  rules: Rules;
}

// --- productos ---

export interface ProductOffer extends Offer {
  type: OfferType.PRODUCT;
  stock: number;
}

export interface Favorite {
  id: string;
  userId: string;
  offerId: string;
  createdAt: string;
}
