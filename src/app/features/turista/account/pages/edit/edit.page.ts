import { Component, OnInit, inject } from '@angular/core';
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
  IonLabel,
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
    IonLabel,
  ],
})
export class EditPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  navService = inject(NavigationService);
  private userService = inject(UserService);

  selectedRole: 'turista' | 'proveedor' | 'admin' = 'turista';

  form = this.fb.group({
    username: [''],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    // Provider fields
    type: ['NATURAL_PERSON'],
    razonSocial: [''],
    nitRut: [''],
    description: [''],
    website: [''],
    // Bank/onboarding fields
    documentType: [''],
    documentNumber: [''],
    bankName: [''],
    bankAccountType: [''],
    bankAccountNumber: [''],
  });

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.selectedRole = user.role;
        this.form.patchValue({
          username: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          type: user.type || 'NATURAL_PERSON',
          razonSocial: user.razonSocial,
          nitRut: user.nitRut,
          description: user.description,
          website: user.website,
          documentType: user.documentType,
          documentNumber: user.documentNumber,
          bankName: user.bankName,
          bankAccountType: user.bankAccountType,
          bankAccountNumber: user.bankAccountNumber,
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

  goToPayments() {
    this.navService.setReturnUrl('/tabs/account/edit');
    this.router.navigate(['/tabs/provider-payments']);
  }
}
