import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonImg,
} from '@ionic/angular/standalone';
import { FavoritesService } from 'src/app/core/services/favorites.services';
import { Offer } from 'src/app/core/models/Offers';
import { OfferService } from 'src/app/core/services/offers';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    IonImg,
    IonButton,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class FavoritesPage implements OnInit {
  favoriteOffers = signal<Offer[]>([]);

  constructor(
    private favoritesService: FavoritesService,
    private offerService: OfferService,
    private router: Router,
    private navService: NavigationService,
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  private loadFavorites() {
    const ids = this.favoritesService.favoriteOfferIds();
    if (ids.length === 0) {
      this.favoriteOffers.set([]);
      return;
    }
    ids.forEach((id) => {
      this.offerService.getById(id).subscribe({
        next: (offer) => {
          this.favoriteOffers.update((prev) => [...prev, offer]);
        },
      });
    });
  }

  async removeLike(offerId: string) {
    await this.favoritesService.removeFavorite(offerId);
    this.favoriteOffers.update((prev) => prev.filter((o) => o.id !== offerId));
  }

  async addLike(offerId: string) {
    await this.favoritesService.addFavorite(offerId);
  }

  goToDetail(offerId: string) {
    this.navService.setReturnUrl('/tabs/account/favorites');
    this.router.navigate(['/tabs/offers', offerId]);
  }
}
