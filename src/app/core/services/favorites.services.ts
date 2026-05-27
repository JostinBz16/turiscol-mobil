import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import { environment } from 'src/environments/environment';

export interface FavoriteDto {
  id: string;
  userId: string;
  offerId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly api = `${environment.apiUrl}/favorites`;

  private favorites = signal<FavoriteDto[]>([]);
  private loaded = false;

  favoriteOfferIds = computed(() => {
    return this.favorites().map((f) => f.offerId);
  });

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    this.loaded = true;
    const userId = this.auth.userId();
    if (!userId) return;
    try {
      const favs = await firstValueFrom(
        this.http.get<FavoriteDto[]>(`${this.api}?userId=${userId}`),
      );
      this.favorites.set(favs);
    } catch {
      console.warn('Error loading favorites, using empty');
      this.favorites.set([]);
    }
  }

  isFavorite(offerId: string): boolean {
    return this.favoriteOfferIds().includes(offerId);
  }

  async addFavorite(offerId: string): Promise<void> {
    await this.ensureLoaded();
    const userId = this.auth.userId();
    if (!userId || this.isFavorite(offerId)) return;

    try {
      const fav = await firstValueFrom(
        this.http.post<FavoriteDto>(this.api, { userId, offerId }),
      );
      this.favorites.set([...this.favorites(), fav]);
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
        this.http.delete(`${this.api}/by-offer?userId=${userId}&offerId=${offerId}`),
      );
      this.favorites.set(
        this.favorites().filter((f) => f.offerId !== offerId),
      );
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
