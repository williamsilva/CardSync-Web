import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';

import { ConciliationService } from '@features/service/conciliation.service';
import {
  ErpVsAcquirerAnalysisModel,
  ReconcileErpAcquirerResultModel,
} from '@models/conciliation.models';
import { compactId, formatCurrency, statusLabel, statusSeverity } from '../conciliation-ui';
import { CsTagComponent } from '@shared/ui';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'cs-erp-vs-acquirer-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule, TooltipModule, CsTagComponent],
  templateUrl: './erp-vs-acquirer-list.component.html',
  styleUrl: './erp-vs-acquirer-list.component.scss',
})
export class ErpVsAcquirerListComponent {
  private readonly service = inject(ConciliationService);
  private readonly toast = inject(ToastService);

  protected readonly rows = signal<ErpVsAcquirerAnalysisModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly reconciling = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pageSize = signal(15);
  protected readonly lastResult = signal<ReconcileErpAcquirerResultModel | null>(null);

  private lastLazyEvent: TableLazyLoadEvent = { first: 0, rows: this.pageSize() };

  protected load(event: TableLazyLoadEvent = this.lastLazyEvent): void {
    this.lastLazyEvent = event;

    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'saleDateErp';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.loading.set(true);

    this.service
      .listErpVsAcquirer({ page, size: rows, sort: `${sortField},${sortOrder}` })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.rows.set(response.content ?? []);
          this.totalRecords.set(response.totalElements ?? 0);
        },
        error: () => {
          this.rows.set([]);
          this.totalRecords.set(0);
          this.toast.error(
            'Erro ao carregar conciliação',
            'Não foi possível buscar a análise ERP x adquirente.',
          );
        },
      });
  }

  protected reconcileManually(): void {
    if (this.reconciling()) return;

    this.reconciling.set(true);
    this.lastResult.set(null);

    this.service
      .reconcileErpVsAcquirer()
      .pipe(finalize(() => this.reconciling.set(false)))
      .subscribe({
        next: (result) => {
          this.lastResult.set(result);
          this.toast.success('Conciliação finalizada', this.resultSummary(result), 7000);
          this.load(this.lastLazyEvent);
        },
        error: () => {
          this.toast.error(
            'Erro na conciliação',
            'Não foi possível processar a conciliação ERP x adquirente.',
          );
        },
      });
  }

  protected resultSummary(result: ReconcileErpAcquirerResultModel | null): string {
    if (!result) return '';

    return [
      `Analisadas: ${this.number(result.analyzed)}`,
      `Conciliadas: ${this.number(result.matched)}`,
      `Atualizadas: ${this.number(result.updated)}`,
      `Bandeiras corrigidas: ${this.number(result.flagUpdated)}`,
      `Contextos atualizados: ${this.number(result.businessContextUpdated)}`,
      `Não encontradas: ${this.number(result.notMatched)}`,
      `Valor divergente: ${this.number(result.valueDivergences)}`,
      `Ambíguas: ${this.number(result.ambiguousMatches)}`,
    ].join(' · ');
  }

  private number(value: number | null | undefined): string {
    return new Intl.NumberFormat('pt-BR').format(value ?? 0);
  }

  protected readonly compactId = compactId;
  protected readonly formatCurrency = formatCurrency;
  protected readonly statusLabel = statusLabel;
  protected readonly statusSeverity = statusSeverity;
}
