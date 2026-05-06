import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { CsTagComponent } from '@shared/ui';
import { FileProcessingService } from '@features/service/file-processing.service';
import {
  formatCurrency,
  commercialStatusSeverity as getCommercialStatusSeverity,
} from '../file-processing-ui';
import {
  ErpPendingSaleModel,
  ReprocessPendingErpResultModel,
} from '@models/file-processing.models';

@Component({
  standalone: true,
  selector: 'cs-erp-pending-sales',
  styleUrl: './erp-pending-sales.component.scss',
  templateUrl: './erp-pending-sales.component.html',
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CsTagComponent,
  ],
})
export class ErpPendingSalesComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly pageSize = signal(15);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly reprocessing = signal(false);
  protected readonly rows = signal<ErpPendingSaleModel[]>([]);
  protected readonly lastResult = signal<ReprocessPendingErpResultModel | null>(null);

  protected load(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'saleDate';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.loading.set(true);
    this.service
      .listPendingErpSales({ page, size: rows, sort: `${sortField},${sortOrder}` })
      .subscribe({
        next: (response) => {
          this.rows.set(response.content ?? []);
          this.totalRecords.set(response.totalElements ?? 0);
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
  }

  protected reprocess(): void {
    this.reprocessing.set(true);
    this.service.reprocessPendingErpSales().subscribe({
      next: (result) => {
        this.lastResult.set(result);
        this.load();
      },
      error: () => this.reprocessing.set(false),
      complete: () => this.reprocessing.set(false),
    });
  }

  protected readonly commercialStatusSeverity = getCommercialStatusSeverity;
  protected readonly formatCurrency = formatCurrency;
}
