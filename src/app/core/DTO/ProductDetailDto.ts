export interface ProductDetailDto {
  uuid: string;
  title: string;
  description: string;
  images: string[];
  cityId: number;
  rating: number;
  providerId: number;
  price: number;
  active: boolean;
  stock: number;
}
