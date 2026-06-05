import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
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
  personOutline,
  bedOutline,
  waterOutline,
  pawOutline,
  peopleOutline,
  calendarOutline,
  timeOutline,
  cubeOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { OfferType } from 'src/app/core/models/Offers';
import {
  accommodationOffers,
  eventOffers,
  productOffers,
} from 'src/app/core/data/ProductMock';
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
  OfferType = OfferType;

  constructor(
    private route: ActivatedRoute,
    private favoritesService: FavoritesService,
    public navService: NavigationService,
  ) {
    addIcons({
      chevronBackOutline,
      personOutline,
      bedOutline,
      waterOutline,
      pawOutline,
      peopleOutline,
      calendarOutline,
      timeOutline,
      cubeOutline,
      heart,
      heartOutline,
      star,
    });
  }

  offer: any;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.offer =
      accommodationOffers.find((o) => o.id === id) ??
      eventOffers.find((o) => o.id === id) ??
      productOffers.find((o) => o.id === id) ??
      null;
  }

  isFavorite(): boolean {
    return this.offer ? this.favoritesService.isFavorite(this.offer.id) : false;
  }

  async toggleFavorite() {
    if (this.offer) {
      await this.favoritesService.toggleFavorite(this.offer.id);
    }
  }
}
