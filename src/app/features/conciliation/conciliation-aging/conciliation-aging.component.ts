import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ConciliationAgingModel } from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import { formatCurrency } from '../conciliation-ui';

@Component({
  selector: 'cs-conciliation-aging',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  templateUrl: './conciliation-aging.component.html',
  styleUrl: './conciliation-aging.component.scss',
})
export class ConciliationAgingComponent {
  private readonly service = inject(ConciliationService);
  protected readonly rows = signal<ConciliationAgingModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalAmount = computed(() =>
    this.rows().reduce((sum, row) => sum + (row.amount ?? 0), 0),
  );
  protected readonly totalQuantity = computed(() =>
    this.rows().reduce((sum, row) => sum + (row.quantity ?? 0), 0),
  );
  constructor() {
    this.reload();
  }
  protected reload(): void {
    this.loading.set(true);
    this.service
      .listAging()
      .subscribe({
        next: (response) => this.rows.set(response ?? []),
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
  }
  protected readonly formatCurrency = formatCurrency;
}
