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
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  alertCircleOutline,
  cardOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { UserService } from 'src/app/core/services/User';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-provider-payments',
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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonList,
    IonSpinner,
  ],
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class ProviderPaymentsPage implements OnInit {
  private userService = inject(UserService);
  navService = inject(NavigationService);

  loading = true;
  saving = false;
  savedMessage = '';
  errorMessage = '';

  form = {
    documentType: '',
    documentNumber: '',
    bankName: '',
    bankAccountType: '',
    bankAccountNumber: '',
  };

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      alertCircleOutline,
      cardOutline,
      chevronBackOutline,
    });
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  get onboardingCompleted(): boolean {
    return Boolean(
      this.form.bankName &&
        this.form.bankAccountType &&
        this.form.bankAccountNumber,
    );
  }

  private async loadProfile() {
    this.loading = true;
    try {
      const user = await firstValueFrom(this.userService.getProfile());
      this.form.documentType = user.documentType ?? '';
      this.form.documentNumber = user.documentNumber ?? '';
      this.form.bankName = user.bankName ?? '';
      this.form.bankAccountType = user.bankAccountType ?? '';
      this.form.bankAccountNumber = user.bankAccountNumber ?? '';
    } catch (err) {
      console.error('Error loading profile', err);
      this.errorMessage = 'No se pudo cargar tu perfil';
    }
    this.loading = false;
  }

  isFormValid(): boolean {
    return Boolean(
      this.form.documentType &&
        this.form.documentNumber.trim() &&
        this.form.bankName.trim() &&
        this.form.bankAccountType &&
        this.form.bankAccountNumber.trim(),
    );
  }

  async save() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Completa todos los campos obligatorios';
      return;
    }
    this.saving = true;
    this.savedMessage = '';
    this.errorMessage = '';
    try {
      await firstValueFrom(
        this.userService.updateProfile({
          documentType: this.form.documentType,
          documentNumber: this.form.documentNumber.trim(),
          bankName: this.form.bankName.trim(),
          bankAccountType: this.form.bankAccountType,
          bankAccountNumber: this.form.bankAccountNumber.trim(),
        }),
      );
      this.savedMessage = 'Datos bancarios guardados correctamente';
    } catch (err) {
      console.error('Error saving payment data', err);
      this.errorMessage = 'No se pudieron guardar los datos';
    }
    this.saving = false;
  }
}
