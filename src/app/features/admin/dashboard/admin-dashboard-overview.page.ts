import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonSpinner, IonRefresher, IonRefresherContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonGrid, IonRow, IonCol,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline, checkmarkCircleOutline, closeCircleOutline, personOutline,
  storefrontOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import { UserService } from 'src/app/core/services/User';
import { UserApi } from 'src/app/core/models/User';
import { firstValueFrom } from 'rxjs';

/**
 * Dashboard/resumen de `/admin-dashboard`. No existe un endpoint de
 * estadísticas en el backend (`GET /users/stats` fue una premisa incorrecta
 * de una auditoría anterior, verificada y descartada). Las métricas se
 * calculan 100% client-side a partir de `UserService.getAll`, pidiendo una
 * página grande (`size: 100`, mismo patrón pragmático que ya usa
 * `admin-festivities.page.ts`) y contando total/activos/inactivos/por rol en
 * el navegador.
 *
 * Limitación aceptada explícitamente: si el volumen real de usuarios supera
 * ese tamaño de página, este resumen deja de ser exacto (solo cuenta la
 * primera página). No es un bug a esconder — es la contraparte de no agregar
 * un endpoint de estadísticas nuevo en el backend. Si el volumen crece,
 * la solución correcta es un endpoint agregador en el servidor, no subir
 * el `size` indefinidamente.
 */
@Component({
  selector: 'app-admin-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonSpinner, IonRefresher, IonRefresherContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonGrid, IonRow, IonCol,
    IonIcon,
  ],
  templateUrl: './admin-dashboard-overview.page.html',
  styleUrls: ['./admin-dashboard-overview.page.scss'],
})
export class AdminDashboardOverviewPage implements OnInit {
  private userService = inject(UserService);

  loading = signal(true);
  users = signal<UserApi[]>([]);

  total = computed(() => this.users().length);
  activeCount = computed(() => this.users().filter((u) => u.active).length);
  inactiveCount = computed(() => this.users().filter((u) => !u.active).length);
  adminCount = computed(() => this.countByRole('ADMIN'));
  providerCount = computed(() => this.countByRole('PROVIDER'));
  consumerCount = computed(() => this.countByRole('CONSUMER'));

  constructor() {
    addIcons({
      peopleOutline, checkmarkCircleOutline, closeCircleOutline, personOutline,
      storefrontOutline, shieldCheckmarkOutline,
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.userService.getAll({ size: 100 }));
      this.users.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading dashboard summary', err);
      this.users.set([]);
    }
    this.loading.set(false);
  }

  async refresh(event: any) {
    await this.loadUsers();
    event.target.complete();
  }

  private countByRole(role: UserApi['role']): number {
    return this.users().filter((u) => u.role === role).length;
  }
}
