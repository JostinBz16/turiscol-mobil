import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonButton,
  IonIcon,
  IonImg,
  IonLabel,
  IonInput,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { logoGoogle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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
    IonContent,
    CommonModule,
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
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

  login() {
    // if (this.loginForm.invalid) {
    //   this.loginForm.markAllAsTouched();

    //   return;
    // }
    this.router.navigate(['/tabs/home']);
  }
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToRememberPassword() {
    this.router.navigate(['/auth/remember-password']);
  }

  loginWithGoogle() {
    console.log('Login with Google');
  }
}
