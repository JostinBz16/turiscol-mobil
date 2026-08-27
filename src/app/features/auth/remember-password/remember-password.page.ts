import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../login/services/auth';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-remember-password',
  standalone: true,
  templateUrl: './remember-password.page.html',
  styleUrls: ['./remember-password.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonItem,
    IonButton,
    IonSpinner,
  ],
})
export class RememberPasswordPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private authService = inject(AuthService);

  form!: FormGroup;
  sent = signal(false);
  loading = signal(false);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      await firstValueFrom(this.authService.forgotPassword(this.form.value.email));
    } catch {
      // El endpoint retorna éxito aunque el email no exista (seguridad)
    }

    this.loading.set(false);
    this.sent.set(true);
    this.form.disable();

    const toast = await this.toastCtrl.create({
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.',
      duration: 4000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }
}
