import { Injectable, computed, signal } from '@angular/core';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import { favoritesMock } from '../data/ProductMock';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favorites = signal(favoritesMock);

  constructor(private auth: AuthService) {}

  // 🔥 ESTE ES EL MÉTODO QUE FALTABA
  favoriteOfferIds = computed<string[]>(() => {
    const userId = this.auth.userId();
    if (!userId) return [];

    return this.favorites()
      .filter((f) => f.userId === userId)
      .map((f) => f.offerId);
  });

  isFavorite(offerId: string): boolean {
    return this.favoriteOfferIds().includes(offerId);
  }

  addFavorite(offerId: string) {
    const userId = this.auth.userId();
    if (!userId || this.isFavorite(offerId)) return;

    this.favorites.set([
      ...this.favorites(),
      {
        // 👇 id ya no es crítico en frontend
        id: `${userId}_${offerId}`,
        userId,
        offerId,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  removeFavorite(offerId: string) {
    const userId = this.auth.userId();
    if (!userId) return;

    this.favorites.set(
      this.favorites().filter(
        (f) => !(f.userId === userId && f.offerId === offerId),
      ),
    );
  }

  toggleFavorite(offerId: string) {
    this.isFavorite(offerId)
      ? this.removeFavorite(offerId)
      : this.addFavorite(offerId);
  }
}
