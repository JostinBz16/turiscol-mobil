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
  IonIcon, IonButton, IonItem, IonLabel, IonInput, IonToggle,
  IonSelect, IonSelectOption, IonSpinner, ToastController,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import {
  LocationService,
  MunicipalityRequest,
  DepartmentResponse,
} from 'src/app/core/services/location.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-city-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonItem, IonLabel, IonInput, IonToggle,
    IonSelect, IonSelectOption, IonSpinner,
  ],
  templateUrl: './admin-city-editor.page.html',
  styleUrls: ['./admin-city-editor.page.scss'],
})
export class AdminCityEditorPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationService = inject(LocationService);
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  isNew = true;
  loading = signal(false);
  saving = signal(false);
  cityId: string | null = null;
  form!: FormGroup;
  departments = signal<DepartmentResponse[]>([]);

  constructor() {
    addIcons({ saveOutline, closeOutline });
    this.initForm();
  }

  async ngOnInit() {
    this.cityId = this.route.snapshot.paramMap.get('id');
    if (this.cityId) {
      this.isNew = false;
    }
    await this.loadDepartments();
    if (this.cityId) {
      await this.loadCity();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      imageUrl: [''],
      departmentId: [null, Validators.required],
      featured: [false],
    });
  }

  private async loadDepartments() {
    try {
      const res = await firstValueFrom(this.locationService.getDepartments({ size: 100 }));
      this.departments.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading departments', err);
      this.departments.set([]);
    }
  }

  private async loadCity() {
    if (!this.cityId) return;
    this.loading.set(true);
    try {
      const city = await firstValueFrom(this.locationService.getCityById(this.cityId));
      this.form.patchValue({
        name: city.name,
        imageUrl: city.imageUrl,
        departmentId: city.department?.id ?? null,
        featured: city.featured,
      });
    } catch (err) {
      console.error('Error loading city', err);
      this.showToast('No se pudo cargar la ciudad', 'danger');
    }
    this.loading.set(false);
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: MunicipalityRequest = this.form.value;
    this.saving.set(true);
    try {
      if (this.isNew) {
        await firstValueFrom(this.locationService.createCity(dto));
        this.showToast('Ciudad creada');
      } else if (this.cityId) {
        await firstValueFrom(this.locationService.updateCity(this.cityId, dto));
        this.showToast('Ciudad actualizada');
      }
      this.router.navigate(['/admin-dashboard/locations/cities']);
    } catch (err) {
      console.error('Error saving city', err);
      this.showToast('Error al guardar la ciudad', 'danger');
    }
    this.saving.set(false);
  }

  cancel() {
    this.router.navigate(['/admin-dashboard/locations/cities']);
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
