import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
  IonRefresherContent, IonList, IonItem, IonLabel, IonBadge, IonInput,
  IonTextarea, IonSelect, IonSelectOption, IonToggle,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, createOutline, trashOutline, closeOutline, saveOutline,
} from 'ionicons/icons';
import { PriceService, PriceListingRequest } from 'src/app/core/services/price';
import { Price } from 'src/app/core/models/Price';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-prices',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
    IonRefresherContent, IonList, IonItem, IonLabel, IonBadge, IonInput,
    IonTextarea, IonSelect, IonSelectOption, IonToggle,
  ],
  templateUrl: './admin-prices.page.html',
  styleUrls: ['./admin-prices.page.scss'],
})
export class AdminPricesPage implements OnInit {
  private priceService = inject(PriceService);
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  prices = signal<Price[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form!: FormGroup;

  categories = [
    'HOSPEDAJE', 'PASADIA', 'GASTRONOMIA', 'TOUR', 'ARTESANIA',
    'TRANSPORTE', 'GUIA', 'SERVICIO_TECNICO', 'TEXTIL', 'BEBIDA', 'OTRO',
  ];

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, closeOutline, saveOutline });
    this.initForm();
  }

  ngOnInit() {
    this.loadPrices();
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      minPrice: [null, [Validators.required, Validators.min(1)]],
      maxPrice: [null, [Validators.required, Validators.min(1)]],
      cityId: [null, Validators.required],
      active: [true],
    });
  }

  async loadPrices() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.priceService.getAll());
      this.prices.set(res.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading prices', err);
    }
    this.loading.set(false);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ active: true });
    this.showForm.set(true);
  }

  openEdit(price: Price) {
    this.editingId.set(price.id);
    this.form.patchValue({
      name: price.name,
      description: price.description,
      category: price.category,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      cityId: price.municipalityId,
      active: price.active,
    });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset({ active: true });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: PriceListingRequest = this.form.value;

    try {
      if (this.editingId()) {
        await firstValueFrom(this.priceService.update(this.editingId()!, dto));
        this.showToast('Precio actualizado');
      } else {
        await firstValueFrom(this.priceService.create(dto));
        this.showToast('Precio creado');
      }
      this.closeForm();
      await this.loadPrices();
    } catch (err) {
      console.error('Error saving price', err);
      this.showToast('Error al guardar el precio', 'danger');
    }
  }

  async confirmDelete(price: Price) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar precio',
      message: `¿Estás seguro de eliminar "${price.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deletePrice(price),
        },
      ],
    });
    await alert.present();
  }

  private async deletePrice(price: Price) {
    try {
      await firstValueFrom(this.priceService.delete(price.id));
      this.prices.set(this.prices().filter((p) => p.id !== price.id));
      this.showToast('Precio eliminado');
    } catch (err) {
      console.error('Error deleting price', err);
      this.showToast('Error al eliminar', 'danger');
    }
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

  async refresh(event: any) {
    await this.loadPrices();
    event.target.complete();
  }

  categoryLabel(cat: string): string {
    const map: Record<string, string> = {
      HOSPEDAJE: 'Hospedaje', PASADIA: 'Pasadía', GASTRONOMIA: 'Gastronomía',
      TOUR: 'Tour', ARTESANIA: 'Artesanía', TRANSPORTE: 'Transporte',
      GUIA: 'Guía', SERVICIO_TECNICO: 'Servicio Técnico', TEXTIL: 'Textil',
      BEBIDA: 'Bebida', OTRO: 'Otro',
    };
    return map[cat] ?? cat;
  }
}
