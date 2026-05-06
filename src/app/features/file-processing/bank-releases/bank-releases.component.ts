import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { FileProcessingService } from '@features/service/file-processing.service';
import { BankReconciliationResultModel, BankReleaseModel } from '@models/file-processing.models';
import { formatCurrency, TagSeverity } from '../file-processing-ui';
import { CsTagComponent } from '@shared/ui';

@Component({
  selector: 'cs-bank-releases',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TableModule, CsTagComponent],
  templateUrl: './bank-releases.component.html',
  styleUrl: './bank-releases.component.scss',
})
export class BankReleasesComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly rows = signal<BankReleaseModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly processingBank = signal(false);
  protected readonly reconcilingBank = signal(false);
  protected readonly lastReconciliation = signal<BankReconciliationResultModel | null>(null);
  protected readonly totalRecords = signal(0);
  protected readonly pageSize = signal(15);

  protected load(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'releaseDate';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.loading.set(true);
    this.service
      .listBankReleases({ page, size: rows, sort: `${sortField},${sortOrder}` })
      .subscribe({
        next: (response) => {
          this.rows.set(response.content ?? []);
          this.totalRecords.set(response.totalElements ?? 0);
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
  }

  protected processBank(): void {
    this.processingBank.set(true);
    this.service.processBank().subscribe({
      next: () => this.load(),
      error: () => this.processingBank.set(false),
      complete: () => this.processingBank.set(false),
    });
  }

  protected reconcileBank(): void {
    this.reconcilingBank.set(true);
    this.lastReconciliation.set(null);
    this.service.reconcileBank().subscribe({
      next: (result) => {
        this.lastReconciliation.set(result);
        this.load();
      },
      error: () => this.reconcilingBank.set(false),
      complete: () => this.reconcilingBank.set(false),
    });
  }

  protected reconciliationSeverity(status?: number | null): TagSeverity {
    if (status === 2) return 'success';
    if (status === 3) return 'danger';
    if (status === 4) return 'warn';
    return 'secondary';
  }

  protected reconciliationLabel(status?: number | null): string {
    if (status === 2) return 'Conciliado';
    if (status === 3) return 'Divergente';
    if (status === 4) return 'Parcial';
    return 'Pendente';
  }

  protected readonly formatCurrency = formatCurrency;
}
