import { Component, OnInit, inject, signal } from '@angular/core';
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
import { BookingService } from 'src/app/core/services/booking';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';
import { BookingModalComponent } from 'src/app/components/booking-modal/booking-modal.component';
import { Booking } from 'src/app/core/models/Reservations';

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
    BookingModalComponent,
  ],
})
export class OfferDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private favoritesService = inject(FavoritesService);
  private offerService = inject(OfferService);
  private bookingService = inject(BookingService);
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
  showBookingModal = signal(false);
  processingPayment = signal(false);

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

  isProduct(): boolean {
    return this.offer?.type === OfferType.PRODUCT;
  }

  ctaLabel(): string {
    return this.isProduct() ? 'Comprar ahora' : 'Reservar ahora';
  }

  openBooking() {
    this.showBookingModal.set(true);
  }

  onBookingCreated(booking: Booking) {
    this.processingPayment.set(true);

    this.bookingService.checkout(booking.id).subscribe({
      next: (checkout) => {
        this.processingPayment.set(false);
        window.open(checkout.checkoutUrl, '_blank');
        this.showBookingModal.set(false);
      },
      error: (err) => {
        this.processingPayment.set(false);
        this.errorMessage = 'Error al iniciar el pago. Intenta de nuevo.';
        console.error('Checkout error', err);
      },
    });
  }
}
