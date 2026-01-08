import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonList,
  IonButton,
  IonInput,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonBackButton,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonHeader,
  ],
})
export class EditPage implements OnInit {
  form = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.form.patchValue({
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '3001234567',
    });
  }

  save() {
    if (this.form.invalid) return;

    console.log('Datos guardados:', this.form.value);
    this.router.navigate(['/account']);
  }
}
