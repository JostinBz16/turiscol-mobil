import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonImg,
  IonChip,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  createOutline,
  storefrontOutline,
  eyeOutline,
  calendarOutline,
  cubeOutline,
  bedOutline,
  peopleOutline,
  timeOutline,
  pawOutline,
  waterOutline,
  cashOutline,
  checkmarkCircle,
  closeCircle,
  alertCircleOutline,
} from 'ionicons/icons';
import { OfferService } from 'src/app/core/services/offers';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-offer-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    IonImg,
    IonChip,
    IonSpinner,
  ],
  templateUrl: './offer-view.page.html',
  styleUrls: ['./offer-view.page.scss'],
})
export class OfferViewPage implements OnInit {
  loading = true;
  error = false;
  errorMessage = '';
  offer: any = null;
  offerId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
  ) {
    addIcons({
      createOutline,
      cashOutline,
      peopleOutline,
      bedOutline,
      waterOutline,
      pawOutline,
      calendarOutline,
      timeOutline,
      cubeOutline,
      alertCircleOutline,
      chevronBackOutline,
      storefrontOutline,
      eyeOutline,
      checkmarkCircle,
      closeCircle,
    });
  }

  async ngOnInit() {
    this.offerId = this.route.snapshot.paramMap.get('id');
    if (this.offerId) {
      await this.loadOffer();
    }
  }

  async loadOffer() {
    if (!this.offerId) return;
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    try {
      this.offer = await firstValueFrom(
        this.offerService.getById(this.offerId),
      );
    } catch (err) {
      this.error = true;
      this.errorMessage = 'No se pudo cargar la oferta';
    }
    this.loading = false;
  }

  goEdit() {
    if (this.offerId) {
      this.router.navigate(['/tabs/manage-offers', this.offerId, 'edit']);
    }
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      accommodation: 'Alojamiento',
      event: 'Evento',
      service: 'Servicio',
      product: 'Producto',
    };
    return map[type?.toLowerCase()] ?? type;
  }

  get firstImage(): string {
    return this.offer?.images?.[0] ?? '';
  }

  get formattedPrice(): string {
    if (!this.offer) return '';
    const price =
      this.offer.pricePerNight ??
      this.offer.ticketPrice ??
      this.offer.pricePerPerson ??
      this.offer.basePrice ??
      this.offer.baseprice;
    return price ? `$${Number(price).toLocaleString('es-CO')}` : '';
  }
}
