import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import { environment } from 'src/environments/environment';

export interface FavoriteOfferDto {
  id: string;
  name: string;
  description: string;
  images: { imageUrl: string; isPrimary?: boolean }[];
  baseprice: number;
  cityId: number;
  providerId: string;
  active: boolean;
  createdAt: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly api = `${environment.apiUrl}/offers/favorites`;

  private favorites = signal<FavoriteOfferDto[]>([]);
  private loaded = false;

  favoriteOfferIds = computed(() => {
    return this.favorites().map((f) => f.id);
  });

  favoriteOffers = computed(() => {
    return this.favorites().map((item) => ({
      ...item,
      images: item.images?.map((img: any) => img.imageUrl) ?? [],
      basePrice: item.baseprice ?? item.baseprice,
    }));
  });

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    const userId = this.auth.userId();
    if (!userId) return;
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.api}?userId=${userId}`),
      );
      this.favorites.set((res.offers ?? []).map((item: any) => ({
        ...item.offer,
        createdAt: item.createdAt,
      })));
    } catch {
      console.warn('Error loading favorites, using empty');
      this.favorites.set([]);
    }
  }

  async load(): Promise<void> {
    await this.ensureLoaded();
  }

  isFavorite(offerId: string): boolean {
    return this.favoriteOfferIds().includes(offerId);
  }

  async addFavorite(offerId: string): Promise<void> {
    await this.ensureLoaded();
    const userId = this.auth.userId();
    if (!userId || this.isFavorite(offerId)) return;

    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.api}`, { userId, offerId }),
      );
      const newFav: FavoriteOfferDto = {
        ...res.offer,
        id: res.offer.id,
        createdAt: res.createdAt,
      };
      this.favorites.set([...this.favorites(), newFav]);
    } catch {
      console.warn('Error adding favorite');
    }
  }

  async removeFavorite(offerId: string): Promise<void> {
    await this.ensureLoaded();
    const userId = this.auth.userId();
    if (!userId) return;

    try {
      await firstValueFrom(
        this.http.delete(
          `${this.api}/by-offer?userId=${userId}&offerId=${offerId}`,
        ),
      );
      this.favorites.set(this.favorites().filter((f) => f.id !== offerId));
    } catch {
      console.warn('Error removing favorite');
    }
  }

  async toggleFavorite(offerId: string): Promise<void> {
    if (this.isFavorite(offerId)) {
      await this.removeFavorite(offerId);
    } else {
      await this.addFavorite(offerId);
    }
  }
}
