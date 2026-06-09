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
  IonSelect,
  IonSelectOption,
  IonTextarea,
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
    IonSelect,
    IonSelectOption,
    IonTextarea,
  ],
})
export class EditPage implements OnInit {
  selectedRole: 'turista' | 'proveedor' | 'admin' = 'turista';

  form = this.fb.group({
    username: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    // Provider fields
    type: ['NATURAL_PERSON'],
    razonSocial: [''],
    nitRut: [''],
    description: [''],
    website: [''],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public navService: NavigationService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.selectedRole = user.role;
        this.form.patchValue({
          username: user.userName,
          email: user.email,
          phone: user.phoneNumber,
          type: user.type || 'NATURAL_PERSON',
          razonSocial: user.razonSocial,
          nitRut: user.nitRut,
          description: user.description,
          website: user.website,
        });

        if (this.selectedRole === 'proveedor') {
          this.form.get('razonSocial')?.setValidators([Validators.required]);
          this.form.get('nitRut')?.setValidators([Validators.required]);
        }
        this.form.updateValueAndValidity();
      },
      error: (err) => console.error('Error fetching profile', err),
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
      error: (err) => console.error('Error updating profile', err),
    });
  }
}
