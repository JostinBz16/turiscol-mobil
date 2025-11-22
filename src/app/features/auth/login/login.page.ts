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
  IonIcon,
  IonImg,
  IonInput,
  IonSelect,
  IonSelectOption,
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
    IonSelect,
    IonSelectOption,
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
    this.router.navigate(['/tabs']);
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

  cities: any[] = [
    { id: 1, name: 'Bogotá', type: 'capital' },
    { id: 2, name: 'Medellín', type: 'ciudad' },
    { id: 3, name: 'Cali', type: 'ciudad' },
    { id: 4, name: 'Barranquilla', type: 'ciudad' },
  ];
}
