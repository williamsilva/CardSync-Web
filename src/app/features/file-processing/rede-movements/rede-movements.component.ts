import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileProcessingService } from '@features/service/file-processing.service';
import {
  RedeAdjustmentModel,
  RedeAnticipationModel,
  RedeCreditOrderModel,
  RedePendingDebtModel,
  RedeSettledDebtModel,
  RedeTotalizerModel,
} from '@models/file-processing.models';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { formatCurrency } from '../file-processing-ui';
import { CsTagComponent } from '@shared/ui';

@Component({
  selector: 'cs-rede-movements',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TableModule,
    TabsModule,
    CsTagComponent,
  ],
  templateUrl: './rede-movements.component.html',
  styleUrl: './rede-movements.component.scss',
})
export class RedeMovementsComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly activeTab = signal('credit-orders');
  protected readonly loading = signal(false);

  protected readonly creditOrders = signal<RedeCreditOrderModel[]>([]);
  protected readonly adjustments = signal<RedeAdjustmentModel[]>([]);
  protected readonly anticipations = signal<RedeAnticipationModel[]>([]);
  protected readonly pendingDebts = signal<RedePendingDebtModel[]>([]);
  protected readonly settledDebts = signal<RedeSettledDebtModel[]>([]);
  protected readonly totalizers = signal<RedeTotalizerModel[]>([]);

  protected readonly totalRecords = signal<Record<string, number>>({});
  protected readonly pageSize = signal(15);

  constructor() {
    this.loadCurrent();
  }

  protected onTabChange(value: string | number | undefined): void {
    this.activeTab.set(String(value));
    this.loadCurrent();
  }

  protected loadCurrent(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const query = { page, size: rows, sort: 'lineNumber,asc' };
    const tab = this.activeTab();

    this.loading.set(true);

    const handlers: Record<string, () => void> = {
      'credit-orders': () =>
        this.service
          .listRedeCreditOrders(query)
          .subscribe((r) =>
            this.apply('credit-orders', r.content, r.totalElements, this.creditOrders),
          ),
      adjustments: () =>
        this.service
          .listRedeAdjustments(query)
          .subscribe((r) =>
            this.apply('adjustments', r.content, r.totalElements, this.adjustments),
          ),
      anticipations: () =>
        this.service
          .listRedeAnticipations(query)
          .subscribe((r) =>
            this.apply('anticipations', r.content, r.totalElements, this.anticipations),
          ),
      'pending-debts': () =>
        this.service
          .listRedePendingDebts(query)
          .subscribe((r) =>
            this.apply('pending-debts', r.content, r.totalElements, this.pendingDebts),
          ),
      'settled-debts': () =>
        this.service
          .listRedeSettledDebts(query)
          .subscribe((r) =>
            this.apply('settled-debts', r.content, r.totalElements, this.settledDebts),
          ),
      totalizers: () =>
        this.service
          .listRedeTotalizers(query)
          .subscribe((r) => this.apply('totalizers', r.content, r.totalElements, this.totalizers)),
    };

    handlers[tab]?.();
  }

  private apply<T>(key: string, rows: T[], total: number, target: { set(value: T[]): void }): void {
    target.set(rows ?? []);
    this.totalRecords.update((current) => ({ ...current, [key]: total ?? 0 }));
    this.loading.set(false);
  }

  protected total(key: string): number {
    return this.totalRecords()[key] ?? 0;
  }

  protected formatCurrency = formatCurrency;
}
