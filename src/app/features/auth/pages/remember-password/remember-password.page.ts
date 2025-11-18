import { Component } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

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
  ],
})
export class RememberPasswordPage {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('Email sent →', this.form.value.email);

    // Aquí llamas tu servicio real
    // authService.sendResetEmail(this.form.value.email).subscribe(...)
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }
}
