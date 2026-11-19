import { Component, inject, signal } from '@angular/core';
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
  IonSpinner, ToastController,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { FestivityService, FestivityRequest } from 'src/app/core/services/festivity.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-festivity-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonItem, IonLabel, IonInput, IonTextarea, IonToggle,
    IonSpinner,
  ],
  templateUrl: './admin-festivity-editor.page.html',
  styleUrls: ['./admin-festivity-editor.page.scss'],
})
export class AdminFestivityEditorPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private festivityService = inject(FestivityService);
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  isNew = true;
  loading = signal(false);
  saving = signal(false);
  festivityId: string | null = null;
  form!: FormGroup;

  constructor() {
    addIcons({ saveOutline, closeOutline });
    this.initForm();
  }

  // Runs on first entry and on every re-entry (Ionic caches the view for this URL).
  async ionViewWillEnter() {
    this.festivityId = this.route.snapshot.paramMap.get('id');
    this.isNew = !this.festivityId;
    this.resetForm();
    if (this.festivityId) {
      await this.loadFestivity();
    }
  }

  private resetForm() {
    this.form.reset({
      name: '',
      description: '',
      startDate: null,
      endDate: null,
      cityId: null,
      image: '',
      active: true,
    });
    this.saving.set(false);
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      cityId: [null, Validators.required],
      image: [''],
      active: [true],
    });
  }

  private async loadFestivity() {
    if (!this.festivityId) return;
    this.loading.set(true);
    try {
      const festivity = await firstValueFrom(
        this.festivityService.getById(this.festivityId),
      );
      this.form.patchValue({
        name: festivity.name,
        description: festivity.description,
        startDate: festivity.startDate,
        endDate: festivity.endDate,
        cityId: festivity.cityId,
        image: festivity.image,
        active: festivity.active,
      });
    } catch (err) {
      console.error('Error loading festivity', err);
      this.showToast('No se pudo cargar la festividad', 'danger');
    }
    this.loading.set(false);
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: FestivityRequest = this.form.value;
    this.saving.set(true);
    try {
      if (this.isNew) {
        await firstValueFrom(this.festivityService.create(dto));
        this.showToast('Festividad creada');
      } else if (this.festivityId) {
        await firstValueFrom(this.festivityService.update(this.festivityId, dto));
        this.showToast('Festividad actualizada');
      }
      this.router.navigate(['/admin-dashboard/festivities']);
    } catch (err) {
      console.error('Error saving festivity', err);
      this.showToast('Error al guardar la festividad', 'danger');
    }
    this.saving.set(false);
  }

  cancel() {
    this.router.navigate(['/admin-dashboard/festivities']);
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
