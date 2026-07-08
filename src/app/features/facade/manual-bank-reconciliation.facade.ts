import { Injectable, inject, signal } from '@angular/core';

import { EMPTY, Observable, finalize, tap } from 'rxjs';

import { CreditOrderApiModel } from '@models/credit-order.model';
import { BankStatementApiModel } from '@models/bank-statement.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { CreditOrderApiService } from '@features/service/credit-order.api.service';
import { CreditOrderAdvancedFilters } from '@features/filter/credit-order.filters';
import { BankStatementApiService } from '@features/service/bank-statement.api.service';
import { BankStatementAdvancedFilters } from '@features/filter/bank-statement.filters';
import {
  ManualBankReconciliationResult,
  ManualBankReconciliationApiService,
} from '@features/service/manual-bank-reconciliation.api.service';

@Injectable({ providedIn: 'root' })
export class ManualBankReconciliationFacade {
  private readonly orderApi = inject(CreditOrderApiService);
  private readonly bankApi = inject(BankStatementApiService);
  private readonly reconcileApi = inject(ManualBankReconciliationApiService);

  private readonly _releasesTotal = signal(0);
  private readonly _releasesLoading = signal(false);
  private readonly _releases = signal<BankStatementApiModel[]>([]);
  private readonly _releasesLastQuery = signal<ListQueryDto<BankStatementAdvancedFilters> | null>(
    null,
  );

  private readonly _ordersTotal = signal(0);
  private readonly _ordersLoading = signal(false);
  private readonly _orders = signal<CreditOrderApiModel[]>([]);
  private readonly _ordersLastQuery = signal<ListQueryDto<CreditOrderAdvancedFilters> | null>(null);

  private readonly _selectedOrders = signal<CreditOrderApiModel[]>([]);
  private readonly _selectedRelease = signal<BankStatementApiModel | null>(null);

  private readonly _reconciling = signal(false);
  private readonly _lastResult = signal<ManualBankReconciliationResult | null>(null);

  readonly releases = this._releases.asReadonly();
  readonly releasesTotal = this._releasesTotal.asReadonly();
  readonly releasesLoading = this._releasesLoading.asReadonly();

  readonly orders = this._orders.asReadonly();
  readonly ordersTotal = this._ordersTotal.asReadonly();
  readonly ordersLoading = this._ordersLoading.asReadonly();

  readonly selectedRelease = this._selectedRelease.asReadonly();
  readonly selectedOrders = this._selectedOrders.asReadonly();

  readonly reconciling = this._reconciling.asReadonly();
  readonly lastResult = this._lastResult.asReadonly();

  loadReleases(q: ListQueryDto<BankStatementAdvancedFilters>): void {
    if (this._releasesLoading()) return;
    this._releasesLoading.set(true);
    this._releasesLastQuery.set(q);
    this.bankApi
      .searchPaged(q)
      .pipe(finalize(() => this._releasesLoading.set(false)))
      .subscribe({
        next: (res) => {
          this._releases.set(res?._embedded?.content ?? []);
          this._releasesTotal.set(res?.page?.totalElements ?? 0);
        },
        error: () => {
          this._releases.set([]);
          this._releasesTotal.set(0);
        },
      });
  }

  reloadReleases(): void {
    const q = this._releasesLastQuery();
    if (q) this.loadReleases(q);
  }

  loadOrders(q: ListQueryDto<CreditOrderAdvancedFilters>): void {
    if (this._ordersLoading()) return;
    this._ordersLoading.set(true);
    this._ordersLastQuery.set(q);
    this.orderApi
      .searchPaged(q)
      .pipe(finalize(() => this._ordersLoading.set(false)))
      .subscribe({
        next: (res) => {
          this._orders.set(res?._embedded?.content ?? []);
          this._ordersTotal.set(res?.page?.totalElements ?? 0);
        },
        error: () => {
          this._orders.set([]);
          this._ordersTotal.set(0);
        },
      });
  }

  reloadOrders(): void {
    const q = this._ordersLastQuery();
    if (q) this.loadOrders(q);
  }

  selectRelease(release: BankStatementApiModel | null): void {
    this._selectedRelease.set(release);
    this._selectedOrders.set([]);
  }

  clearSelection(): void {
    this._selectedRelease.set(null);
    this._selectedOrders.set([]);
  }

  clearOrders(): void {
    this._selectedOrders.set([]);
  }

  toggleOrder(order: CreditOrderApiModel): void {
    const current = this._selectedOrders();
    const exists = current.some((o) => o.id === order.id);
    this._selectedOrders.set(
      exists ? current.filter((o) => o.id !== order.id) : [...current, order],
    );
  }

  isOrderSelected(order: CreditOrderApiModel): boolean {
    return this._selectedOrders().some((o) => o.id === order.id);
  }

  reconcile(): Observable<ManualBankReconciliationResult> {
    const release = this._selectedRelease();
    const orders = this._selectedOrders();
    if (!release || !orders.length || this._reconciling()) return EMPTY;

    this._reconciling.set(true);
    return this.reconcileApi
      .reconcile({ releaseBankId: release.id, creditOrderIds: orders.map((o) => o.id) })
      .pipe(
        tap((result) => {
          this._lastResult.set(result);
          this._selectedRelease.set(null);
          this._selectedOrders.set([]);
        }),
        finalize(() => this._reconciling.set(false)),
      );
  }
}
