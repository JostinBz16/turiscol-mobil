import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonIcon, IonButton, IonSpinner,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline, lockClosed, lockOpen, star, starOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { OfferService } from 'src/app/core/services/offers';
import { UserService } from 'src/app/core/services/User';
import { LocationService } from 'src/app/core/services/location.service';
import { Offer } from 'src/app/core/models/Offers';
import {
  AdminBreadcrumb,
  AdminPageHeaderComponent,
} from '../../shared/admin-page-header/admin-page-header.component';
import {
  MODERATION_COPY,
  ModerationAction,
  confirmModeration,
  formatOfferDate,
  formatOfferPrice,
  offerActionErrorMessage,
  offerStatusLabel,
  offerTypeLabel,
  shortId,
} from '../admin-offer.utils';

@Component({
  selector: 'app-admin-offer-detail',
  standalone: true,
  imports: [
    IonContent, IonIcon, IonButton, IonSpinner,
    AdminPageHeaderComponent,
  ],
  templateUrl: './admin-offer-detail.page.html',
  styleUrls: ['./admin-offer-detail.page.scss'],
})
export class AdminOfferDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private offerService = inject(OfferService);
  private userService = inject(UserService);
  private locationService = inject(LocationService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  offerId: string | null = null;
  offer = signal<Offer | null>(null);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  updating = signal(false);

  cityName = signal<string | null>(null);
  providerName = signal<string | null>(null);

  breadcrumbs = computed<AdminBreadcrumb[]>(() => [
    { label: 'Ofertas', link: '/admin-dashboard/offers' },
    { label: this.offer()?.name ?? 'Detalle' },
  ]);

  typeLabel = offerTypeLabel;
  statusLabel = offerStatusLabel;
  formatPrice = formatOfferPrice;
  formatDate = formatOfferDate;

  constructor() {
    addIcons({
      alertCircleOutline, lockClosed, lockOpen, star, starOutline,
    });
  }

  ngOnInit() {
    this.offerId = this.route.snapshot.paramMap.get('id');
    if (this.offerId) {
      this.loadOffer();
    } else {
      this.errorMessage.set('Oferta no encontrada');
      this.loading.set(false);
    }
  }

  async loadOffer() {
    if (!this.offerId) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const offer = await firstValueFrom(this.offerService.getById(this.offerId));
      this.offer.set(offer);
      this.loading.set(false);
      this.loadRelatedNames(offer);
    } catch (err: any) {
      console.error('Error loading offer', err);
      this.errorMessage.set(
        err?.status === 404
          ? 'La oferta no existe o fue eliminada'
          : err?.status === 403
            ? 'No tienes permisos para ver esta oferta'
            : 'No se pudo cargar la oferta',
      );
      this.loading.set(false);
    }
  }

  /** City and provider names are secondary: on failure the raw id is shown. */
  private loadRelatedNames(offer: Offer) {
    this.cityName.set(null);
    this.providerName.set(null);
    if (offer.cityId !== undefined && offer.cityId !== null) {
      firstValueFrom(this.locationService.getCityById(offer.cityId))
        .then((city) => this.cityName.set(city?.name ?? null))
        .catch((err) => console.error('Error loading city', err));
    }
    if (offer.providerId) {
      firstValueFrom(this.userService.getById(offer.providerId))
        .then((user) => this.providerName.set(user?.userName ?? null))
        .catch((err) => console.error('Error loading provider', err));
    }
  }

  providerLabel(offer: Offer): string {
    return this.providerName() ?? shortId(offer.providerId);
  }

  toggleBlock() {
    const current = this.offer();
    if (current) this.moderate(current.blocked ? 'unblock' : 'block');
  }

  toggleFeatured() {
    const current = this.offer();
    if (current) this.moderate(current.featured ? 'unfeature' : 'feature');
  }

  private async moderate(action: ModerationAction) {
    const current = this.offer();
    if (!current || this.updating()) return;
    if (!(await confirmModeration(this.alertCtrl, action, current.name))) return;

    this.updating.set(true);
    try {
      switch (action) {
        case 'block':
          await firstValueFrom(this.offerService.block(current.id));
          this.offer.set({ ...current, blocked: true, active: false });
          break;
        case 'unblock':
          // Unblocking does not reactivate the offer: keep `active` as is.
          await firstValueFrom(this.offerService.unblock(current.id));
          this.offer.set({ ...current, blocked: false });
          break;
        case 'feature':
        case 'unfeature':
          await firstValueFrom(this.offerService.setFeatured(current.id, action === 'feature'));
          this.offer.set({ ...current, featured: action === 'feature' });
          break;
      }
      this.showToast(MODERATION_COPY[action].success);
    } catch (err) {
      console.error('Error moderating offer', err);
      this.showToast(offerActionErrorMessage(err), 'danger');
    }
    this.updating.set(false);
  }

  private async showToast(message: string, color = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
