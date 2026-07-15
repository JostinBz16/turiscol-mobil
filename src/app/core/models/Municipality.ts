export interface Municipality {
  id: number;
  name: string;
  imageUrl?: string;
  featured?: boolean;
  department?: { id: number; name: string };
}
