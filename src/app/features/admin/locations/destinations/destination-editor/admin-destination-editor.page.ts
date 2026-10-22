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
  IonIcon, IonButton, IonItem, IonLabel, IonInput, IonTextarea, IonToggle,
  IonSelect, IonSelectOption, IonSpinner, ToastController,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import {
  LocationService,
  DestinationRequest,
  DestinationType,
  MunicipalityResponse,
} from 'src/app/core/services/location.service';
import { firstValueFrom } from 'rxjs';

const DESTINATION_TYPE_LABELS: Record<DestinationType, string> = {
  VIEWPOINT: 'Mirador',
  SPOT: 'Lugar de interés',
  HISTORICAL_SITE: 'Sitio histórico',
  MUSEUM: 'Museo',
  PARK: 'Parque',
  BEACH: 'Playa',
  NATURAL_RESERVE: 'Reserva natural',
};

@Component({
  selector: 'app-admin-destination-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonItem, IonLabel, IonInput, IonTextarea, IonToggle,
    IonSelect, IonSelectOption, IonSpinner,
  ],
  templateUrl: './admin-destination-editor.page.html',
  styleUrls: ['./admin-destination-editor.page.scss'],
})
export class AdminDestinationEditorPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationService = inject(LocationService);
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  isNew = true;
  loading = signal(false);
  saving = signal(false);
  destinationId: string | null = null;
  form!: FormGroup;
  cities = signal<MunicipalityResponse[]>([]);

  destinationTypes: DestinationType[] = [
    'VIEWPOINT',
    'SPOT',
    'HISTORICAL_SITE',
    'MUSEUM',
    'PARK',
    'BEACH',
    'NATURAL_RESERVE',
  ];

  constructor() {
    addIcons({ saveOutline, closeOutline });
    this.initForm();
  }

  async ngOnInit() {
    this.destinationId = this.route.snapshot.paramMap.get('id');
    if (this.destinationId) {
      this.isNew = false;
    }
    await this.loadCities();
    if (this.destinationId) {
      await this.loadDestination();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      imageUrl: [''],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      destinationType: [null, Validators.required],
      municipalityId: [null, Validators.required],
      active: [true],
      featured: [false],
    });
  }

  private async loadCities() {
    try {
      const res = await firstValueFrom(this.locationService.getCities({ size: 100 }));
      this.cities.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading cities', err);
      this.cities.set([]);
    }
  }

  /**
   * `DestinationResponseDTO` (api-documentation.md:2119-2131) NO incluye
   * `destinationType` ni un `imageUrl` plano (solo `imageUrls: string[]` y
   * `municipality` anidado) — a diferencia de `MunicipalityResponseDTO`, que sí
   * trae todo lo necesario para precargar su propio editor. Es un hueco real de
   * la API, no un error de esta UI: por eso, al editar, `destinationType` queda
   * sin precargar (el usuario debe volver a elegirlo, el campo sigue siendo
   * requerido) y `imageUrl` se precarga con la primera URL de `imageUrls` como
   * mejor aproximación posible, no con un campo que el backend no devuelve.
   */
  private async loadDestination() {
    if (!this.destinationId) return;
    this.loading.set(true);
    try {
      const destination = await firstValueFrom(
        this.locationService.getDestinationById(this.destinationId),
      );
      this.form.patchValue({
        name: destination.name,
        description: destination.description,
        imageUrl: destination.imageUrls?.[0] ?? '',
        latitude: destination.latitude,
        longitude: destination.longitude,
        municipalityId: destination.municipality?.id ?? null,
        active: destination.active,
        featured: destination.featured,
      });
    } catch (err) {
      console.error('Error loading destination', err);
      this.showToast('No se pudo cargar el destino', 'danger');
    }
    this.loading.set(false);
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: DestinationRequest = this.form.value;
    this.saving.set(true);
    try {
      if (this.isNew) {
        await firstValueFrom(this.locationService.createDestination(dto));
        this.showToast('Destino creado');
      } else if (this.destinationId) {
        await firstValueFrom(this.locationService.updateDestination(this.destinationId, dto));
        this.showToast('Destino actualizado');
      }
      this.router.navigate(['/admin-dashboard/locations/destinations']);
    } catch (err) {
      console.error('Error saving destination', err);
      this.showToast('Error al guardar el destino', 'danger');
    }
    this.saving.set(false);
  }

  cancel() {
    this.router.navigate(['/admin-dashboard/locations/destinations']);
  }

  destinationTypeLabel(type: DestinationType): string {
    return DESTINATION_TYPE_LABELS[type] ?? type;
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
