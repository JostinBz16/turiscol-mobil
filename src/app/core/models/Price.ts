export interface Price {
  id: string;
  name: string;
  description: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  municipalityId: string;
  active: boolean;
}
