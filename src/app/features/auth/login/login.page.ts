import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';


import {
  IonItem,
  IonButton,
  IonToast,
  IonImg,
  IonInput,
  IonContent,
  IonText,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonText,
    IonInput,
    IonToast,
    ReactiveFormsModule,
    IonImg,
    IonButton,
    IonItem,
    CommonModule,
    IonContent,
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  IsShowingToast: boolean = false;
  toastMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService
      .loginWithPassword(this.loginForm.value)
      .subscribe({
        next: () => {
          const user = this.authService.user();
          if (user) {
            this.redirectByRole(user.role);
          }
        },
        error: (err) => {
          this.toastMessage = err.error?.message || err.message || 'Error al iniciar sesión';
          this.IsShowingToast = true;
        },
      });
  }



  redirectByRole(role: string) {
    if (role === 'proveedor') {
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
}
