import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { CsTagComponent } from '@shared/ui';
import { ConciliationFeeAnalysisModel } from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import {
  compactId,
  statusLabel,
  formatPercent,
  formatCurrency,
  statusSeverity,
} from '../conciliation-ui';

@Component({
  standalone: true,
  selector: 'cs-conciliation-fees-list',
  styleUrl: './conciliation-fees-list.component.scss',
  templateUrl: './conciliation-fees-list.component.html',
  imports: [CommonModule, ButtonModule, CardModule, TableModule, CsTagComponent],
})
export class ConciliationFeesListComponent {
  private readonly service = inject(ConciliationService);

  protected readonly rows = signal<ConciliationFeeAnalysisModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pageSize = signal(15);

  protected load(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'saleDate';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.loading.set(true);
    this.service.listFees({ page, size: rows, sort: `${sortField},${sortOrder}` }).subscribe({
      next: (response) => {
        this.rows.set(response.content ?? []);
        this.totalRecords.set(response.totalElements ?? 0);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected readonly compactId = compactId;
  protected readonly formatCurrency = formatCurrency;
  protected readonly formatPercent = formatPercent;
  protected readonly statusLabel = statusLabel;
  protected readonly statusSeverity = statusSeverity;
}
