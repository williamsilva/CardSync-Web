import { Injectable, computed, inject, signal } from '@angular/core';

import { EMPTY, Observable, finalize, tap } from 'rxjs';

import { CreditOrderApiModel } from '@models/credit-order.model';
import { BankStatementApiModel } from '@models/bank-statement.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { CreditOrderApiService } from '@features/service/credit-order.api.service';
import { CreditOrderAdvancedFilters } from '@features/filter/credit-order.filters';
import { BankStatementApiService } from '@features/service/bank-statement.api.service';
import { BankStatementAdvancedFilters } from '@features/filter/bank-statement.filters';
import {
  MarkLegacyResult,
  ManualBankReconciliationResult,
  ManualBankReconciliationApiService,
  ReclassifyBankStatementFlagsResult,
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
  private readonly _selectedOrders = signal<CreditOrderApiModel[]>([]);
  private readonly _ordersLastQuery = signal<ListQueryDto<CreditOrderAdvancedFilters> | null>(null);

  /**
   * Lançamentos bancários selecionados. Normalmente contém no máximo 1 item — a
   * conciliação manual (vínculo com ordens de crédito) exige exatamente 1. Quando
   * todos os lançamentos selecionados são elegíveis para marcação de legado, o
   * componente permite acumular mais de um aqui para marcação em lote.
   */
  private readonly _selectedReleases = signal<BankStatementApiModel[]>([]);

  private readonly _reconciling = signal(false);
  private readonly _lastResult = signal<ManualBankReconciliationResult | null>(null);

  private readonly _reclassifyingFlags = signal(false);

  readonly releases = this._releases.asReadonly();
  readonly releasesTotal = this._releasesTotal.asReadonly();
  readonly releasesLoading = this._releasesLoading.asReadonly();

  readonly orders = this._orders.asReadonly();
  readonly ordersTotal = this._ordersTotal.asReadonly();
  readonly ordersLoading = this._ordersLoading.asReadonly();

  readonly selectedReleases = this._selectedReleases.asReadonly();
  readonly selectedOrders = this._selectedOrders.asReadonly();

  /** Conveniência: o único lançamento selecionado, quando a seleção tem exatamente 1 item. */
  readonly selectedRelease = computed<BankStatementApiModel | null>(() => {
    const releases = this._selectedReleases();
    return releases.length === 1 ? releases[0] : null;
  });

  readonly reconciling = this._reconciling.asReadonly();
  readonly lastResult = this._lastResult.asReadonly();
  readonly reclassifyingFlags = this._reclassifyingFlags.asReadonly();

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

  /** Substitui a seleção por um único lançamento (ou limpa, se null). Uso: releases não elegíveis para legado. */
  selectSingleRelease(release: BankStatementApiModel | null): void {
    this._selectedReleases.set(release ? [release] : []);
    this._selectedOrders.set([]);
  }

  /** Adiciona/remove um lançamento da seleção, preservando os demais. Uso: acumular releases elegíveis para legado. */
  toggleReleaseInSelection(release: BankStatementApiModel): void {
    const current = this._selectedReleases();
    const exists = current.some((r) => r.id === release.id);
    this._selectedReleases.set(
      exists ? current.filter((r) => r.id !== release.id) : [...current, release],
    );
    this._selectedOrders.set([]);
  }

  clearSelection(): void {
    this._selectedReleases.set([]);
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

  markLegacy(): Observable<MarkLegacyResult> {
    const releases = this._selectedReleases();
    if (!releases.length || this._reconciling()) return EMPTY;

    this._reconciling.set(true);
    return this.reconcileApi.markLegacy(releases.map((r) => r.id)).pipe(
      tap(() => {
        this._selectedReleases.set([]);
        this._selectedOrders.set([]);
      }),
      finalize(() => this._reconciling.set(false)),
    );
  }

  reconcile(divergenceReason?: string | null): Observable<ManualBankReconciliationResult> {
    const releases = this._selectedReleases();
    const orders = this._selectedOrders();
    if (releases.length !== 1 || !orders.length || this._reconciling()) return EMPTY;

    const release = releases[0];
    this._reconciling.set(true);
    return this.reconcileApi
      .reconcile({
        releaseBankId: release.id,
        creditOrderIds: orders.map((o) => o.id),
        divergenceReason,
      })
      .pipe(
        tap((result) => {
          this._lastResult.set(result);
          this._selectedReleases.set([]);
          this._selectedOrders.set([]);
        }),
        finalize(() => this._reconciling.set(false)),
      );
  }

  /** Backfill único: reclassifica a bandeira de todos os lançamentos bancários já importados. */
  reclassifyFlags(): Observable<ReclassifyBankStatementFlagsResult> {
    if (this._reclassifyingFlags()) return EMPTY;

    this._reclassifyingFlags.set(true);
    return this.reconcileApi
      .reclassifyFlags()
      .pipe(finalize(() => this._reclassifyingFlags.set(false)));
  }
}
