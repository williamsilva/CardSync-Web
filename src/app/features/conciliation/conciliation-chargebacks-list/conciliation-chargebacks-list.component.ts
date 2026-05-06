import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ConciliationService } from '@features/service/conciliation.service';
import { ChargebackAnalysisModel } from '@models/conciliation.models';
import { compactId, formatCurrency, statusLabel, statusSeverity } from '../conciliation-ui';
import { CsTagComponent } from '@shared/ui';

@Component({
  selector: 'cs-conciliation-chargebacks-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule, CsTagComponent],
  templateUrl: './conciliation-chargebacks-list.component.html',
  styleUrl: './conciliation-chargebacks-list.component.scss',
})
export class ConciliationChargebacksListComponent {
  private readonly service = inject(ConciliationService);
  protected readonly rows = signal<ChargebackAnalysisModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pageSize = signal(15);
  protected load(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'disputeDate';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.loading.set(true);
    this.service
      .listChargebacks({ page, size: rows, sort: `${sortField},${sortOrder}` })
      .subscribe({
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
  protected readonly statusLabel = statusLabel;
  protected readonly statusSeverity = statusSeverity;
}
