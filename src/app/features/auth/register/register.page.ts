import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../login/services/auth';
import { RegisterRequestDTO } from './models/register-request';
import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonTextarea,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, businessOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  step: 'type' | 'form' = 'type';
  selectedRole: 'customer' | 'provider' = 'customer';

  form = this.fb.group({
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phoneNumber: [''],
    // Provider specific
    type: ['NATURAL_PERSON'],
    razonSocial: [''],
    description: [''],
    nitRut: [''],
    website: [''],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    addIcons({ personOutline, businessOutline });
  }

  selectType(role: 'customer' | 'provider') {
    this.selectedRole = role;
    this.step = 'form';

    // Adjust validators based on role
    if (role === 'provider') {
      this.form.get('razonSocial')?.setValidators([Validators.required]);
      this.form.get('nitRut')?.setValidators([Validators.required]);
    } else {
      this.form.get('razonSocial')?.clearValidators();
      this.form.get('nitRut')?.clearValidators();
    }
    this.form.get('razonSocial')?.updateValueAndValidity();
    this.form.get('nitRut')?.updateValueAndValidity();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const common = {
      userName: val.userName!,
      email: val.email!,
      password: val.password!,
      phoneNumber: val.phoneNumber || undefined,
    };

    let dto: RegisterRequestDTO;

    if (this.selectedRole === 'provider') {
      dto = {
        ...common,
        userType: 'PROVIDER',
        type: val.type as any,
        razonSocial: val.razonSocial!,
        description: val.description || undefined,
        nitRut: val.nitRut!,
        website: val.website || undefined,
      };
    } else {
      dto = {
        ...common,
        userType: 'TOURIST',
      };
    }

    this.authService.register(dto).subscribe({
      next: () => {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Registration error', err);
      },
    });
  }

  reset() {
    this.step = 'type';
    this.form.reset({ type: 'NATURAL_PERSON' });
  }

  goBack() {
    if (this.step === 'form') {
      this.reset();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
