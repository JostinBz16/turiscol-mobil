export interface ProductDetailDto {
  uuid: string;
  title: string;
  description: string;
  categoryId: number;
  images: string[];
  cityId: number;
  rating: number;
  providerId: number;
  price: number;
  active: boolean;
  stock: number;
}
