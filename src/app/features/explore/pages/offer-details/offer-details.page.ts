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
import { OfferService } from 'src/app/core/services/offers';
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
    private offerService: OfferService,
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
    if (id) {
      this.offerService.getById(id).subscribe((offer) => {
        this.offer = offer;
      });
    }
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      accommodation: 'Alojamiento',
      event: 'Evento',
      service: 'Servicio',
      product: 'Producto',
    };
    return map[type] ?? type;
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
