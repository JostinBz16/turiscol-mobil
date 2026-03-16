import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonImg,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FavoritesService } from 'src/app/core/services/favorites.services';
import {
  chevronBackOutline,
  heart,
  heartOutline,
  star,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { offersMock } from 'src/app/core/data/ProductMock';
import { Offer } from 'src/app/core/models/Offers';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.page.html',
  styleUrls: ['./offer-details.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonImg,
    IonContent,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
})
export class OfferDetailsPage implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private favoritesService: FavoritesService,
    public navService: NavigationService,
  ) {
    addIcons({ heart, heartOutline, star, chevronBackOutline });
  }

  offer?: Offer;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.offer = offersMock.find((o) => o.id === id);
  }

  isFavorite(): boolean {
    return this.offer ? this.favoritesService.isFavorite(this.offer.id) : false;
  }

  toggleFavorite() {
    if (this.offer) {
      this.favoritesService.toggleFavorite(this.offer.id);
    }
  }
}
