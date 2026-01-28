import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

type LoginMode = 'TOURIST' | 'PROVIDER';

import {
  IonItem,
  IonButton,
  IonIcon,
  IonImg,
  IonInput,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { logoGoogle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    ReactiveFormsModule,
    IonImg,
    IonIcon,
    IonButton,
    IonItem,
    CommonModule,
  ],
})
export class LoginPage implements OnInit {
  loginMode: LoginMode = 'TOURIST';
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons({
      logoGoogle,
    });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  loginProvider() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService
      .loginMocked(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: (user) => this.redirectByRole(user.role),
        error: () => alert('Credenciales inválidas'),
      });
  }

  setMode(mode: LoginMode) {
    this.loginMode = mode;
    this.loginForm.reset();
  }

  // 🔑 TURISTA
  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  redirectByRole(role: string) {
    if (role === 'PROVIDER') {
      this.router.navigate(['/provider/dashboard'], { replaceUrl: true });
    } else {
      this.router.navigate(['/tabs/home'], { replaceUrl: true });
    }
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToRememberPassword() {
    this.router.navigate(['/auth/remember-password']);
  }

  cities: any[] = [
    { id: 1, name: 'Bogotá', type: 'capital' },
    { id: 2, name: 'Medellín', type: 'ciudad' },
    { id: 3, name: 'Cali', type: 'ciudad' },
    { id: 4, name: 'Barranquilla', type: 'ciudad' },
  ];
}
