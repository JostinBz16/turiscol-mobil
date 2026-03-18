import { ServiceCategory } from './Offers';

export interface Price {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  minPrice: number;
  maxPrice: number;
  municipalityId: string;
  active: boolean;
}
