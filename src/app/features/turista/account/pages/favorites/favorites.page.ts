import { Component, OnInit, computed } from '@angular/core';
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
  IonButton,
  IonImg,
} from '@ionic/angular/standalone';
import { FavoritesService } from 'src/app/core/services/favorites.services';
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
  favoriteOffers = computed(() => this.favoritesService.favoriteOffers());

  constructor(
    private favoritesService: FavoritesService,
    private router: Router,
    private navService: NavigationService,
  ) {}

  async ngOnInit() {
    await this.favoritesService.load();
  }

  async removeLike(offerId: string) {
    await this.favoritesService.removeFavorite(offerId);
  }

  goToDetail(offerId: string) {
    this.navService.setReturnUrl('/tabs/account/favorites');
    this.router.navigate(['/tabs/offers', offerId]);
  }
}
