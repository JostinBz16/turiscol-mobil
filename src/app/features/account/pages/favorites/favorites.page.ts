import { Component, computed, OnInit } from '@angular/core';
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
import { OfferMockService } from 'src/app/core/services/mocks/offer-mock.service';
import { Router } from '@angular/router';

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
export class FavoritesPage {
  favoriteOffers = computed<Offer[]>(() => {
    const ids = this.favoritesService.favoriteOfferIds();

    return ids
      .map((id) => this.offerService.findByIdSync(id))
      .filter((offer): offer is Offer => offer !== null);
  });

  constructor(
    private favoritesService: FavoritesService,
    private offerService: OfferMockService,
    private router: Router,
  ) {}

  removeLike(offerId: string) {
    this.favoritesService.removeFavorite(offerId);
  }

  addLike(offerId: string) {
    this.favoritesService.addFavorite(offerId);
  }

  goToDetail(offerId: string) {
    this.router.navigate(['/tabs/offers', offerId]);
  }
}
