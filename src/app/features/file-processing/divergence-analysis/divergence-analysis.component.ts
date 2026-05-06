import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { CsTagComponent } from '@shared/ui';
import { FileProcessingService } from '@features/service/file-processing.service';
import {
  ProcessedFileModel,
  ErpPendingSaleModel,
  RedeAdjustmentModel,
  RedeCreditOrderModel,
} from '@models/file-processing.models';
import {
  formatCurrency,
  fileStatusSeverity as getFileStatusSeverity,
  commercialStatusSeverity as getCommercialStatusSeverity,
} from '../file-processing-ui';

@Component({
  standalone: true,
  selector: 'cs-divergence-analysis',
  styleUrl: './divergence-analysis.component.scss',
  templateUrl: './divergence-analysis.component.html',
  imports: [CommonModule, RouterLink, CardModule, TableModule, ButtonModule, CsTagComponent],
})
export class DivergenceAnalysisComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly loading = signal(false);
  protected readonly files = signal<ProcessedFileModel[]>([]);
  protected readonly erpPendings = signal<ErpPendingSaleModel[]>([]);
  protected readonly creditOrders = signal<RedeCreditOrderModel[]>([]);
  protected readonly adjustments = signal<RedeAdjustmentModel[]>([]);

  protected readonly metrics = computed(() => {
    const files = this.files();
    const pendings = this.erpPendings();
    const creditOrders = this.creditOrders();
    const adjustments = this.adjustments();

    return {
      filesWithError: files.filter((f) => f.status === 'ERROR').length,
      filesWithWarnings: files.filter((f) => f.status === 'PROCESSED_WITH_WARNINGS').length,
      pendingContracts: pendings.filter((p) => p.commercialStatus === 'PENDING_CONTRACT').length,
      pendingContext: pendings.filter((p) => p.commercialStatus !== 'PENDING_CONTRACT').length,
      creditOrdersTotal: creditOrders.reduce((sum, item) => sum + (item.releaseValue ?? 0), 0),
      adjustmentsTotal: adjustments.reduce((sum, item) => sum + (item.adjustmentValue ?? 0), 0),
    };
  });

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);

    this.service.listFiles({ page: 0, size: 20, sort: 'dateImport,desc' }).subscribe({
      next: (page) => this.files.set(page.content ?? []),
    });

    this.service.listPendingErpSales({ page: 0, size: 20, sort: 'saleDate,desc' }).subscribe({
      next: (page) => this.erpPendings.set(page.content ?? []),
    });

    this.service.listRedeCreditOrders({ page: 0, size: 20, sort: 'releaseDate,desc' }).subscribe({
      next: (page) => this.creditOrders.set(page.content ?? []),
    });

    this.service.listRedeAdjustments({ page: 0, size: 20, sort: 'lineNumber,asc' }).subscribe({
      next: (page) => this.adjustments.set(page.content ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected readonly fileStatusSeverity = getFileStatusSeverity;
  protected readonly commercialStatusSeverity = getCommercialStatusSeverity;
  protected readonly formatCurrency = formatCurrency;
}
