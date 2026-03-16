import { Rules } from '../models/Offers';

export interface EventDetailDto {
  id: string;
  name: string;
  description: string;
  categoryId: number;
  images: string[];
  city: number;
  score: number;
  provider: number;
  base_price: number;
  enabled: boolean;
  date: string;
  capacity: number;
  access: string;
  rules: Rules;
}
