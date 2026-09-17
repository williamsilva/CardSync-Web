import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { ConciliationWaitingFacade } from '@features/facade/conciliation-waiting.facade';
import {
  AmbiguousCreditOrderBatchModel,
  AmbiguousCreditOrderCandidateModel,
} from '@models/conciliation-waiting.model';

interface AmbiguousBatchRow extends AmbiguousCreditOrderBatchModel {
  key: string;
}

/**
 * Vínculo manual pro resíduo que CreditOrderOrphanLinkingService deixa intencionalmente órfão:
 * lotes de liquidação (Cielo "Chave UR") com 2+ SalesSummary do MESMO valor, onde desambiguar
 * automaticamente por valor nunca aponta um único candidato com segurança. Cada linha de ordem
 * órfã tem um seletor com os resumos candidatos do mesmo lote — o operador escolhe e confirma,
 * nunca o sistema sozinho.
 */
@Component({
  standalone: true,
  selector: 'app-manual-ambiguous-credit-order',
  templateUrl: './manual-ambiguous-credit-order.component.html',
  styleUrl: './manual-ambiguous-credit-order.component.scss',
  imports: [
    Select,
    Tooltip,
    ButtonModule,
    FormsModule,
    CsDatePipe,
    TableModule,
    CsCurrencyPipe,
    InputTextModule,
    TranslateModule,
  ],
})
export class ManualAmbiguousCreditOrderComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(MessageService);
  private readonly facade = inject(ConciliationWaitingFacade);

  protected readonly loading = signal(false);
  protected readonly batches = signal<AmbiguousBatchRow[]>([]);
  protected readonly filterText = signal('');
  protected readonly expandedKeys = signal<Set<string>>(new Set());

  /** orderId -> salesSummaryId escolhido no seletor daquela linha, ainda não confirmado. */
  protected readonly selectedSummaryByOrderId = signal<Record<string, string>>({});
  /** orderId em vinculação neste momento — desabilita o botão só daquela linha. */
  protected readonly linkingOrderId = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  protected refresh(): void {
    this.loading.set(true);
    this.facade.listAmbiguousCreditOrderBatches().subscribe({
      next: (batches) => {
        this.batches.set(batches.map((b) => ({ ...b, key: `${b.acquirerId}:${b.pvNumber}:${b.rvNumber}` })));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('conciliation.manualAmbiguousCreditOrder.loadError'),
        });
      },
    });
  }

  protected toggle(key: string): void {
    this.expandedKeys.update((keys) => {
      const next = new Set(keys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  protected isExpanded(key: string): boolean {
    return this.expandedKeys().has(key);
  }

  protected filteredBatches() {
    const term = this.filterText().trim();
    if (!term) return this.batches();
    return this.batches().filter(
      (b) => String(b.rvNumber).includes(term) || String(b.pvNumber).includes(term),
    );
  }

  protected summaryOptions(batch: AmbiguousBatchRow) {
    return batch.summaries.map((s) => ({
      label: this.summaryOptionLabel(s),
      value: s.id,
    }));
  }

  private summaryOptionLabel(s: AmbiguousBatchRow['summaries'][number]): string {
    const value = s.liquidValue != null ? this.formatCurrency(s.liquidValue) : '-';
    const installments = s.installmentTotal != null
      ? `${s.installmentsLinked}/${s.installmentTotal}`
      : `${s.installmentsLinked}`;
    return `R$ ${value} · ${s.rvDate ?? '-'} · ${installments} parcelas`;
  }

  private formatCurrency(v: number): string {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected onSelectSummary(orderId: string, salesSummaryId: string | null): void {
    this.selectedSummaryByOrderId.update((map) => {
      const next = { ...map };
      if (salesSummaryId) {
        next[orderId] = salesSummaryId;
      } else {
        delete next[orderId];
      }
      return next;
    });
  }

  protected link(batch: AmbiguousBatchRow, order: AmbiguousCreditOrderCandidateModel): void {
    const salesSummaryId = this.selectedSummaryByOrderId()[order.id];
    if (!salesSummaryId || this.linkingOrderId()) return;

    this.linkingOrderId.set(order.id);
    this.facade.linkAmbiguousCreditOrder({ creditOrderId: order.id, salesSummaryId }).subscribe({
      next: () => {
        this.linkingOrderId.set(null);
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('conciliation.manualAmbiguousCreditOrder.linkSuccess'),
        });
        this.applyLinkLocally(batch, order.id, salesSummaryId);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (err: any) => {
        this.linkingOrderId.set(null);
        this.toast.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: err?.error?.technicalMessage ?? this.i18n.tUi('conciliation.manualAmbiguousCreditOrder.linkError'),
        });
      },
    });
  }

  /**
   * Atualiza o lote localmente sem recarregar tudo — remove a ordem vinculada e soma na conta de
   * parcelas do resumo escolhido. Se o lote não tem mais nenhuma ordem órfã depois disso, some da
   * lista (mesma condição usada pelo backend pra listar um lote como ambíguo).
   */
  private applyLinkLocally(batch: AmbiguousBatchRow, orderId: string, salesSummaryId: string): void {
    this.batches.update((all) =>
      all
        .map((b) => {
          if (b.key !== batch.key) return b;
          const orders = b.orders.filter((o) => o.id !== orderId);
          const summaries = b.summaries.map((s) =>
            s.id === salesSummaryId ? { ...s, installmentsLinked: s.installmentsLinked + 1 } : s,
          );
          return { ...b, orders, summaries };
        })
        .filter((b) => b.orders.length > 0),
    );
    this.selectedSummaryByOrderId.update((map) => {
      const next = { ...map };
      delete next[orderId];
      return next;
    });
  }
}
