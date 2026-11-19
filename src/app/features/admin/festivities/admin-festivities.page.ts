import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  IonBadge,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  chevronForwardOutline,
  closeOutline,
  refreshOutline,
  saveOutline,
  trashOutline,
} from 'ionicons/icons';
import {
  FestivityService,
  FestivityRequest,
} from 'src/app/core/services/festivity.service';
import { Festivity } from 'src/app/core/models/Festivity';
import { firstValueFrom } from 'rxjs';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-admin-festivities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonIcon,
    IonButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonBadge,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    AdminPageHeaderComponent,
  ],
  templateUrl: './admin-festivities.page.html',
  styleUrls: ['./admin-festivities.page.scss'],
})
export class AdminFestivitiesPage {
  private festivityService = inject(FestivityService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private fb = inject(FormBuilder);

  festivities = signal<Festivity[]>([]);
  loading = signal(true);

  editorOpen = signal(false);
  editingId = signal<string | null>(null);
  editorLoading = signal(false);
  saving = signal(false);
  form!: FormGroup;

  constructor() {
    addIcons({
      refreshOutline,
      addOutline,
      calendarOutline,
      trashOutline,
      chevronForwardOutline,
      closeOutline,
      saveOutline,
    });
    this.initForm();
  }

  // True after the first entry; later entries reload silently (Ionic caches the view).
  private entered = false;

  ionViewWillEnter() {
    this.loadFestivities(this.entered);
    this.entered = true;
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

  async loadFestivities(silent = false) {
    if (!silent) this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.festivityService.getAll({ size: 100 }),
      );
      this.festivities.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading festivities', err);
      if (!silent) this.festivities.set([]);
    }
    this.loading.set(false);
  }

  /** Opens the shared editor in create mode, or loads the given festivity to edit it. */
  async openEditor(festivity?: Festivity) {
    this.editingId.set(festivity?.id ?? null);
    this.form.reset({ active: true });
    this.editorOpen.set(true);
    if (!festivity) return;

    this.editorLoading.set(true);
    try {
      const data = await firstValueFrom(
        this.festivityService.getById(festivity.id),
      );
      this.form.patchValue({
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        cityId: data.cityId,
        image: data.image,
        active: data.active,
      });
    } catch (err) {
      console.error('Error loading festivity', err);
      this.showToast('No se pudo cargar la festividad', 'danger');
      this.closeEditor();
    } finally {
      this.editorLoading.set(false);
    }
  }

  closeEditor() {
    this.editorOpen.set(false);
    this.editingId.set(null);
    this.editorLoading.set(false);
    this.saving.set(false);
    this.form.reset({ active: true });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const dto: FestivityRequest = {
      name: value.name,
      description: value.description ?? '',
      startDate: value.startDate,
      endDate: value.endDate,
      cityId: Number(value.cityId),
      image: value.image ?? '',
      active: !!value.active,
    };

    this.saving.set(true);
    try {
      const id = this.editingId();
      if (id) {
        await firstValueFrom(this.festivityService.update(id, dto));
        this.showToast('Festividad actualizada');
      } else {
        await firstValueFrom(this.festivityService.create(dto));
        this.showToast('Festividad creada');
      }
      this.closeEditor();
      await this.loadFestivities(true);
    } catch (err) {
      console.error('Error saving festivity', err);
      this.showToast('Error al guardar la festividad', 'danger');
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDelete(festivity: Festivity) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar festividad',
      message: `¿Estás seguro de eliminar "${festivity.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteFestivity(festivity),
        },
      ],
    });
    await alert.present();
  }

  private async deleteFestivity(festivity: Festivity) {
    try {
      await firstValueFrom(this.festivityService.delete(festivity.id));
      this.festivities.set(
        this.festivities().filter((f) => f.id !== festivity.id),
      );
      this.showToast('Festividad eliminada');
    } catch (err) {
      console.error('Error deleting festivity', err);
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

  async refresh(event?: any) {
    await this.loadFestivities();
    event?.target?.complete();
  }
}
