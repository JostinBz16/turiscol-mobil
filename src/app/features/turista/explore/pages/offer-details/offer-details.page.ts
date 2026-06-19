import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonImg,
  IonIcon,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { firstValueFrom } from 'rxjs';

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
    IonSpinner,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
})
export class OfferDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private favoritesService = inject(FavoritesService);
  private offerService = inject(OfferService);
  navService = inject(NavigationService);

  OfferType = OfferType;

  constructor() {
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
  offerId: string = '';
  loading = false;
  error = false;
  errorMessage = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.offerId = id;
      this.loadOffer(id);
    }
  }

  async loadOffer(id: string) {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';

    try {
      const offer = await firstValueFrom(this.offerService.getById(id));
      this.offer = offer;
    } catch (e) {
      this.error = true;
      this.errorMessage = 'No se encontró la oferta';
    } finally {
      this.loading = false;
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

  goBack() {
    const url = this.navService.returnUrl();
    if (url) {
      this.router.navigate([url]);
    } else {
      this.router.navigate(['/tabs/offers']);
    }
  }
}
