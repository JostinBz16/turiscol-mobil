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
  IonIcon, IonButton, IonItem, IonInput, IonSpinner, ToastController,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import {
  LocationService,
  DepartmentRequest,
} from 'src/app/core/services/location.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-department-editor',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonItem, IonInput, IonSpinner,
  ],
  templateUrl: './admin-department-editor.page.html',
  styleUrls: ['./admin-department-editor.page.scss'],
})
export class AdminDepartmentEditorPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationService = inject(LocationService);
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  isNew = true;
  loading = signal(false);
  saving = signal(false);
  departmentId: string | null = null;
  form!: FormGroup;

  constructor() {
    addIcons({ saveOutline, closeOutline });
    this.initForm();
  }

  // Runs on first entry and on every re-entry (Ionic caches the view for this URL).
  async ionViewWillEnter() {
    this.departmentId = this.route.snapshot.paramMap.get('id');
    this.isNew = !this.departmentId;
    this.resetForm();
    if (this.departmentId) {
      await this.loadDepartment();
    }
  }

  private resetForm() {
    this.form.reset({ name: '' });
    this.saving.set(false);
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
    });
  }

  private async loadDepartment() {
    if (!this.departmentId) return;
    this.loading.set(true);
    try {
      const department = await firstValueFrom(
        this.locationService.getDepartmentById(this.departmentId),
      );
      this.form.patchValue({ name: department.name });
    } catch (err) {
      console.error('Error loading department', err);
      this.showToast('No se pudo cargar el departamento', 'danger');
    }
    this.loading.set(false);
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: DepartmentRequest = this.form.value;
    this.saving.set(true);
    try {
      if (this.isNew) {
        await firstValueFrom(this.locationService.createDepartment(dto));
        this.showToast('Departamento creado');
      } else if (this.departmentId) {
        await firstValueFrom(this.locationService.updateDepartment(this.departmentId, dto));
        this.showToast('Departamento actualizado');
      }
      this.router.navigate(['/admin-dashboard/locations/departments']);
    } catch (err) {
      console.error('Error saving department', err);
      this.showToast('Error al guardar el departamento', 'danger');
    }
    this.saving.set(false);
  }

  cancel() {
    this.router.navigate(['/admin-dashboard/locations/departments']);
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
