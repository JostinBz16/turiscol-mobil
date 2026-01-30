export interface AccommodationDetailDto {
  id: string;
  title: string;
  description: string;
  imgs: string[];
  city_id: number;
  rating: number;
  provider_id: number;
  price: number;
  is_active: boolean;
  max_guests: number;
  rules: {
    children: boolean;
    pets: boolean;
    prices: {
      adult: number;
      child: number;
      pet?: number;
    };
  };
}
