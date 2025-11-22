import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  step: 'type' | 'tourist' | 'provider' = 'type';

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  selectType(type: 'tourist' | 'provider') {
    this.step = type;
  }

  loginWithGoogle() {
    console.log('Google login...');
    // TODO Google Auth service
  }

  submit() {
    if (this.form.invalid) return;
    console.log('Provider form data', this.form.value);

    // TODO: backend call
  }

  reset() {
    this.step = 'type';
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }
}
