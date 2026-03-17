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
import { NavigationService } from 'src/app/core/services/navigation.service';
import { UserService } from 'src/app/core/services/User';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public navService: NavigationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.form.patchValue({
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        });
      },
      error: (err) => console.error('Error fetching profile', err)
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.userService.updateProfile(this.form.value as any).subscribe({
      next: () => {
        this.router.navigate(['/tabs/account']);
      },
      error: (err) => console.error('Error updating profile', err)
    });
  }
}
