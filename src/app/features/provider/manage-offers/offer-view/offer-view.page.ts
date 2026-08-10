import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonInput,
  IonLabel,
  IonItem,
  IonList,
  IonText,
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
  imageOutline,
  trashOutline,
  starOutline,
  cameraOutline,
  linkOutline,
  star,
  alertCircleOutline,
} from 'ionicons/icons';
import { OfferService } from 'src/app/core/services/offers';
import { MunicipalityService } from 'src/app/core/services/municipality.service';
import { OfferImageService, OfferImage } from 'src/app/core/services/offer-image.service';
import { ReviewService, Review, RatingSummary } from 'src/app/core/services/review.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-offer-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonInput,
    IonLabel,
    IonItem,
    IonList,
  ],
  templateUrl: './offer-view.page.html',
  styleUrls: ['./offer-view.page.scss'],
})
export class OfferViewPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(OfferService);
  private municipalityService = inject(MunicipalityService);
  private imageService = inject(OfferImageService);
  private reviewService = inject(ReviewService);
  navService = inject(NavigationService);

  Math = Math;

  loading = true;
  error = false;
  errorMessage = '';
  offer: any = null;
  offerId: string | null = null;
  cityName = '';

  images: OfferImage[] = [];
  imagesLoading = false;
  newImageUrl = '';
  uploading = false;
  imageActionId: string | null = null;

  reviews: Review[] = [];
  reviewsLoading = false;
  ratingSummary: RatingSummary | null = null;

  stock: number | null = null;
  stockLoading = false;
  restockQty = 1;
  restocking = false;
  stockMessage = '';

  constructor() {
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
      imageOutline,
      trashOutline,
      starOutline,
      cameraOutline,
      linkOutline,
      star,
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
      if (this.offer.cityId) {
        const city = await firstValueFrom(
          this.municipalityService.getById(String(this.offer.cityId)),
        );
        this.cityName = city.name ?? '';
      }
      await this.loadImages();
      await this.loadReviews();
      await this.loadStock();
    } catch (err) {
      this.error = true;
      this.errorMessage = 'No se pudo cargar la oferta';
    }
    this.loading = false;
  }

  private async loadImages() {
    if (!this.offerId) return;
    this.imagesLoading = true;
    try {
      this.images = await firstValueFrom(this.imageService.getImages(this.offerId));
    } catch {
      this.images = [];
    }
    this.imagesLoading = false;
  }

  get isProduct(): boolean {
    return this.offer?.type === 'product';
  }

  async loadStock() {
    if (!this.offerId || !this.isProduct) return;
    this.stockLoading = true;
    try {
      this.stock = await firstValueFrom(this.offerService.getStock(this.offerId));
    } catch {
      this.stock = null;
    }
    this.stockLoading = false;
  }

  async restock() {
    if (!this.offerId || !this.restockQty || this.restockQty < 1) return;
    this.restocking = true;
    this.stockMessage = '';
    try {
      await firstValueFrom(this.offerService.restock(this.offerId, this.restockQty, 'Reposición manual'));
      await this.loadStock();
      this.restockQty = 1;
      this.stockMessage = 'Stock actualizado';
    } catch (err) {
      console.error('Error restocking', err);
      this.stockMessage = 'No se pudo actualizar el stock';
    }
    this.restocking = false;
  }

  private async loadReviews() {    if (!this.offerId) return;
    this.reviewsLoading = true;
    try {
      const page = await firstValueFrom(
        this.reviewService.getReviewsByOffer(this.offerId, 0, 50),
      );
      this.reviews = page.content ?? [];
    } catch {
      this.reviews = [];
    }
    try {
      this.ratingSummary = await firstValueFrom(
        this.reviewService.getRatingSummary(this.offerId),
      );
    } catch {
      this.ratingSummary = null;
    }
    this.reviewsLoading = false;
  }

  get averageRating(): number {
    return this.ratingSummary?.average ?? 0;
  }

  get totalReviews(): number {
    return this.ratingSummary?.totalReviews ?? this.reviews.length;
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const date = new Date(iso);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  async addImageByUrl() {
    if (!this.offerId) return;
    const url = this.newImageUrl.trim();
    if (!url) return;
    try {
      const image = await firstValueFrom(
        this.imageService.addByUrl(this.offerId, url, this.images.length === 0),
      );
      this.images.push(image);
      this.newImageUrl = '';
    } catch (err) {
      console.error('Error adding image', err);
      this.errorMessage = 'No se pudo agregar la imagen';
    }
  }

  async onFileSelected(event: any) {
    if (!this.offerId) return;
    const file = event?.target?.files?.[0];
    if (!file) return;
    this.uploading = true;
    try {
      const image = await firstValueFrom(
        this.imageService.upload(this.offerId, file, this.images.length === 0),
      );
      this.images.push(image);
      event.target.value = '';
    } catch (err) {
      console.error('Error uploading image', err);
      this.errorMessage = 'No se pudo subir la imagen';
    }
    this.uploading = false;
  }

  async deleteImage(image: OfferImage) {
    if (!this.offerId) return;
    this.imageActionId = image.id;
    try {
      await firstValueFrom(this.imageService.delete(this.offerId, image.id));
      this.images = this.images.filter((img) => img.id !== image.id);
    } catch (err) {
      console.error('Error deleting image', err);
      this.errorMessage = 'No se pudo eliminar la imagen';
    }
    this.imageActionId = null;
  }

  async setPrimary(image: OfferImage) {
    if (!this.offerId) return;
    this.imageActionId = image.id;
    try {
      await firstValueFrom(this.imageService.setPrimary(this.offerId, image.id));
      this.images = this.images.map((img) => ({
        ...img,
        isPrimary: img.id === image.id,
      }));
    } catch (err) {
      console.error('Error setting primary image', err);
      this.errorMessage = 'No se pudo marcar la imagen como principal';
    }
    this.imageActionId = null;
  }

  goEdit() {
    if (this.offerId) {
      this.navService.setReturnUrl(`/tabs/manage-offers/${this.offerId}`);
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
    return (
      this.images.find((img) => img.isPrimary)?.imageUrl ??
      this.images[0]?.imageUrl ??
      this.offer?.images?.[0] ??
      ''
    );
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
