import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
} from '@ionic/angular/standalone';

export interface AdminBreadcrumb {
  label: string;
  /** Router link; when omitted the item is rendered as plain text (current page). */
  link?: string | any[];
}

@Component({
  selector: 'app-admin-page-header',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
  ],
  templateUrl: './admin-page-header.component.html',
  styleUrls: ['./admin-page-header.component.scss'],
})
export class AdminPageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  breadcrumbs = input<AdminBreadcrumb[]>([]);
}
