export interface ProductDetailDto {
  id: string;
  name: string;
  description: string;
  providerId: string;
  baseprice: number;
  cityId: number;
  active: boolean;
  images: { imageUrl: string; publicId?: string; isPrimary?: boolean }[];
  type: string;
  productCategory: string;
  isUnlimitedStock: boolean;
  currentStock?: number;
}
