import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonImg, IonFab, IonFabButton,
  IonToggle, IonSpinner, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, createOutline, trashOutline, eyeOutline, chevronForwardOutline, storefrontOutline, filterOutline, powerOutline,
} from 'ionicons/icons';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import { OfferService } from 'src/app/core/services/offers';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Offer } from 'src/app/core/models/Offers';
import { firstValueFrom } from 'rxjs';

interface OfferItem {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  active: boolean;
  image: string;
}

@Component({
  selector: 'app-manage-offers',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonImg, IonFab, IonFabButton,
    IonToggle, IonSpinner, IonRefresher, IonRefresherContent,
  ],
  templateUrl: './manage-offers.page.html',
  styleUrls: ['./manage-offers.page.scss'],
})
export class ManageOffersPage implements OnInit {
  private offerService = inject(OfferService);
  private authStore = inject(AuthService);
  private router = inject(Router);
  navService = inject(NavigationService);

  offers: OfferItem[] = [];
  loading = true;

  constructor() {
    addIcons({
      addOutline, createOutline, trashOutline, eyeOutline, chevronForwardOutline,
      storefrontOutline, filterOutline, powerOutline,
    });
  }

  async ngOnInit() {
    await this.loadOffers();
  }

  async loadOffers() {
    this.loading = true;
    try {
      const providerId = this.authStore.userId();
      if (!providerId) return;

      const res = await firstValueFrom(
        this.offerService.findAll({ providerId, page: 0, size: 100 })
      );
      const content = res.content ?? [];
      this.offers = content.map((o: any) => ({
        id: o.id,
        name: o.name,
        type: o.type ?? o.offerType ?? '',
        basePrice: o.baseprice ?? o.basePrice ?? 0,
        active: o.active ?? true,
        image: o.images?.[0]?.imageUrl ?? o.images?.[0] ?? '',
      }));
    } catch (err) {
      console.error('Error loading offers', err);
    }
    this.loading = false;
  }

  async toggleActive(offer: OfferItem, event: any) {
    const detail = event.detail;
    if (!detail) return;
    try {
      if (detail.checked) {
        await firstValueFrom(this.offerService.activate(offer.id));
      } else {
        await firstValueFrom(this.offerService.deactivate(offer.id));
      }
      offer.active = detail.checked;
    } catch (err) {
      console.error('Error toggling offer', err);
      detail.checked = !detail.checked;
    }
  }

  async deleteOffer(offer: OfferItem) {
    try {
      await firstValueFrom(this.offerService.delete(offer.id));
      this.offers = this.offers.filter((o) => o.id !== offer.id);
    } catch (err) {
      console.error('Error deleting offer', err);
    }
  }

  viewOffer(id: string) {
    this.navService.setReturnUrl('/tabs/manage-offers');
    this.router.navigate(['/tabs/manage-offers', id]);
  }

  editOffer(id: string) {
    this.navService.setReturnUrl('/tabs/manage-offers');
    this.router.navigate(['/tabs/manage-offers', id, 'edit']);
  }

  createOffer() {
    this.navService.setReturnUrl('/tabs/manage-offers');
    this.router.navigate(['/tabs/manage-offers/new']);
  }

  async refresh(event: any) {
    await this.loadOffers();
    event.target.complete();
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
}
