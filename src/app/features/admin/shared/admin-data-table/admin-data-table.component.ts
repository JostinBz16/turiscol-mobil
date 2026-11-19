import {
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

export interface AdminTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface AdminCellContext<T = any> {
  $implicit: T;
  column: AdminTableColumn;
}

export interface AdminActionsContext<T = any> {
  $implicit: T;
}

@Component({
  selector: 'app-admin-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, IonButton, IonIcon, IonSpinner],
  templateUrl: './admin-data-table.component.html',
})
export class AdminDataTableComponent<T = any> {
  columns = input<AdminTableColumn[]>([]);
  rows = input<T[]>([]);
  loading = input(false);
  emptyMessage = input('No hay datos para mostrar');
  /** Row property used to track rows; falls back to the row index. */
  rowKey = input<string>();

  /** Zero-based current page. Pagination is shown only when totalPages > 0. */
  page = input(0);
  totalPages = input(0);
  totalElements = input<number>();
  pageChange = output<number>();

  cellTpl = contentChild<TemplateRef<AdminCellContext<T>>>('cell');
  actionsTpl = contentChild<TemplateRef<AdminActionsContext<T>>>('actions');

  hasPrev = computed(() => this.page() > 0);
  hasNext = computed(() => this.page() + 1 < this.totalPages());

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  trackRow(row: T, index: number): unknown {
    const key = this.rowKey();
    return key ? (row as any)?.[key] ?? index : index;
  }

  cellValue(row: T, column: AdminTableColumn): unknown {
    return (row as any)?.[column.key];
  }

  goTo(page: number) {
    if (page < 0 || page >= this.totalPages() || page === this.page()) return;
    this.pageChange.emit(page);
  }
}
