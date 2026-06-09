import { Component, OnInit } from '@angular/core';
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
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { OfferService } from 'src/app/core/services/offers';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-offer-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonSpinner,
  ],
  templateUrl: './offer-editor.page.html',
  styleUrls: ['./offer-editor.page.scss'],
})
export class OfferEditorPage implements OnInit {
  isNew = true;
  loading = false;
  saving = false;
  offerId: string | null = null;

  form: any = {
    name: '',
    description: '',
    baseprice: 0,
    type: 'accommodation',
    active: true,
    // accommodation
    pricePerNight: null,
    maxGuests: null,
    bedrooms: null,
    bathrooms: null,
    allowPets: false,
    allowChildren: false,
    accommodationCategory: null,
    // event
    ticketPrice: null,
    startDate: null,
    endDate: null,
    maximumCapacity: null,
    eventType: null,
    // service
    pricePerPerson: null,
    durationInMinutes: null,
    capacity: null,
    requiresSchedule: false,
    serviceCategory: null,
    // product
    currentStock: null,
    productCategory: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
  ) {
    addIcons({ saveOutline, closeOutline });
  }

  async ngOnInit() {
    this.offerId = this.route.snapshot.paramMap.get('id');
    if (this.offerId) {
      this.isNew = false;
      await this.loadOffer();
    }
  }

  private async loadOffer() {
    if (!this.offerId) return;
    this.loading = true;
    try {
      const offer: any = await firstValueFrom(
        this.offerService.getById(this.offerId),
      );
      this.form = {
        ...this.form,
        name: offer.name ?? '',
        description: offer.description ?? '',
        baseprice: offer.baseprice ?? offer.basePrice ?? 0,
        type: offer.type ?? 'accommodation',
        active: offer.active ?? true,
        pricePerNight: offer.pricePerNight ?? null,
        maxGuests: offer.maxGuests ?? null,
        bedrooms: offer.bedrooms ?? null,
        bathrooms: offer.bathrooms ?? null,
        allowPets: offer.allowPets ?? false,
        allowChildren: offer.allowChildren ?? false,
        accommodationCategory: offer.accommodationCategory ?? null,
        ticketPrice: offer.ticketPrice ?? null,
        startDate: offer.startDate ?? null,
        endDate: offer.endDate ?? null,
        maximumCapacity: offer.maximumCapacity ?? null,
        eventType: offer.eventType ?? null,
        pricePerPerson: offer.pricePerPerson ?? null,
        durationInMinutes: offer.durationInMinutes ?? null,
        capacity: offer.capacity ?? null,
        requiresSchedule: offer.requiresSchedule ?? false,
        serviceCategory: offer.serviceCategory ?? null,
        currentStock: offer.currentStock ?? offer.stock ?? null,
        productCategory: offer.productCategory ?? null,
      };
    } catch (err) {
      console.error('Error loading offer', err);
    }
    this.loading = false;
  }

  async save() {
    this.saving = true;
    try {
      const data: any = {
        name: this.form.name,
        description: this.form.description,
        baseprice: this.form.baseprice,
        type: this.form.type,
        active: this.form.active,
      };

      const type = this.form.type;
      if (type === 'accommodation') {
        data.pricePerNight = this.form.pricePerNight;
        data.maxGuests = this.form.maxGuests;
        data.bedrooms = this.form.bedrooms;
        data.bathrooms = this.form.bathrooms;
        data.allowPets = this.form.allowPets;
        data.allowChildren = this.form.allowChildren;
        data.accommodationCategory = this.form.accommodationCategory;
      } else if (type === 'event') {
        data.ticketPrice = this.form.ticketPrice;
        data.startDate = this.form.startDate;
        data.endDate = this.form.endDate;
        data.maximumCapacity = this.form.maximumCapacity;
        data.eventType = this.form.eventType;
      } else if (type === 'service') {
        data.pricePerPerson = this.form.pricePerPerson;
        data.durationInMinutes = this.form.durationInMinutes;
        data.capacity = this.form.capacity;
        data.requiresSchedule = this.form.requiresSchedule;
        data.serviceCategory = this.form.serviceCategory;
      } else if (type === 'product') {
        data.currentStock = this.form.currentStock;
        data.productCategory = this.form.productCategory;
      }

      if (this.isNew) {
        await firstValueFrom(this.offerService.create(data));
      } else if (this.offerId) {
        await firstValueFrom(this.offerService.update(this.offerId, data));
      }
      this.router.navigate(['/tabs/manage-offers']);
    } catch (err) {
      console.error('Error saving offer', err);
    }
    this.saving = false;
  }

  cancel() {
    this.router.navigate(['/tabs/manage-offers']);
  }
}
