export interface Destination {
  id: string;
  name: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  image?: string;
  cityId: number;
  active: boolean;
}
