import { Injectable, inject, signal } from '@angular/core';

import { Observable, finalize, tap } from 'rxjs';

import { I18nService } from '@core/i18n/i18n.service';
import { ToastService } from '@core/toast/toast.service';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ConciliationWaitingApiService } from '@features/service/conciliation-waiting.api.service';
import { ConciliationWaitingAdvancedFilters } from '@features/filter/conciliation-waiting.filter';
import {
  ErpAcquirerTruthSource,
  ConciliationWaitingModel,
  ErpAcquirerComparisonModel,
  ReconcileErpAcquirerResultModel,
  ErpAcquirerResolutionResultModel,
  ErpAcquirerBatchResolutionResultModel,
} from '@models/conciliation-waiting.model';

export type ConciliationErpVsAcquirerView =
  | 'missing-acquirer'
  | 'missing-erp'
  | 'other-divergences';

type MissingErpQuery = ListQueryDto<ConciliationWaitingAdvancedFilters>;
type MissingAcquirerQuery = ListQueryDto<ConciliationWaitingAdvancedFilters>;
type OtherDivergencesQuery = ListQueryDto<ConciliationWaitingAdvancedFilters>;
type ConciliationQuery = MissingAcquirerQuery | MissingErpQuery | OtherDivergencesQuery;

@Injectable({ providedIn: 'root' })
export class ConciliationWaitingFacade {
  private readonly api = inject(ConciliationWaitingApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _totalsLoading = signal(false);

  private readonly _data = signal<ConciliationWaitingModel[]>([]);
  private readonly _lastQuery = signal<ConciliationQuery | null>(null);
  private readonly _totals = signal<TransactionsTotalsModel | null>(null);
  private readonly _lastView = signal<ConciliationErpVsAcquirerView | null>(null);

  readonly sales = this._data.asReadonly();
  readonly totals = this._totals.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly totalsLoading = this._totalsLoading.asReadonly();

  load(view: 'missing-erp', q: MissingErpQuery): void;
  load(view: 'missing-acquirer', q: MissingAcquirerQuery): void;
  load(view: 'other-divergences', q: OtherDivergencesQuery): void;

  load(view: ConciliationErpVsAcquirerView, q: ConciliationQuery): void {
    if (this._loading()) return;

    this._loading.set(true);
    this._lastView.set(view);
    this._lastQuery.set(q);

    this.searchByView(view, q)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (res) => {
          this._data.set(res?._embedded?.content ?? []);
          this._total.set(res?.page?.totalElements ?? 0);
        },
        error: () => {
          this._data.set([]);
          this._total.set(0);
        },
      });
  }

  reloadLast(): void {
    const view = this._lastView();
    const q = this._lastQuery();

    if (!view || !q) return;

    this.load(view as never, q as never);
  }

  calculateTotals(): void {
    const view = this._lastView();
    const q = this._lastQuery();

    if (!view || !q || this._totalsLoading()) return;

    this._totalsLoading.set(true);

    this.calculateTotalsByView(view, q)
      .pipe(finalize(() => this._totalsLoading.set(false)))
      .subscribe({
        next: (totals) => this._totals.set(totals),
        error: () => this._totals.set(null),
      });
  }

  clearTotals(): void {
    this._totals.set(null);
  }

  compareErpVsAcquirer(
    erpTransactionId: string,
    acquirerTransactionId: string,
  ): Observable<ErpAcquirerComparisonModel> {
    return this.api.compareErpVsAcquirer(erpTransactionId, acquirerTransactionId);
  }

  reconcileErpVsAcquirerManually(
    erpTransactionId: string,
    acquirerTransactionId: string,
    truthSource: ErpAcquirerTruthSource,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.api
      .reconcileErpVsAcquirerManually(erpTransactionId, acquirerTransactionId, truthSource)
      .pipe(tap(() => this.clearTotals()));
  }

  createErpFromAcquirer(
    acquirerTransactionId: string,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.api
      .createErpFromAcquirer(acquirerTransactionId)
      .pipe(tap(() => this.clearTotals()));
  }

  createErpFromAcquirerBatch(
    acquirerTransactionIds: string[],
  ): Observable<ErpAcquirerBatchResolutionResultModel> {
    return this.api
      .createErpFromAcquirerBatch(acquirerTransactionIds)
      .pipe(tap(() => this.clearTotals()));
  }

  markErpAsDeleted(erpTransactionId: string): Observable<ErpAcquirerResolutionResultModel> {
    return this.api.markErpAsDeleted(erpTransactionId).pipe(tap(() => this.clearTotals()));
  }

  markErpAsDeletedBatch(
    erpTransactionIds: string[],
  ): Observable<ErpAcquirerBatchResolutionResultModel> {
    return this.api.markErpAsDeletedBatch(erpTransactionIds).pipe(tap(() => this.clearTotals()));
  }

  reconcileErpVsAcquirer(): Observable<ReconcileErpAcquirerResultModel> {
    return this.api.reconcileErpVsAcquirer().pipe(
      tap((result) => {
        this.clearTotals();
        this.showReconciliationResultToast(result);
      }),
    );
  }

  private searchByView(view: ConciliationErpVsAcquirerView, q: ConciliationQuery) {
    switch (view) {
      case 'missing-acquirer':
        return this.api.missingAcquirer(q as MissingAcquirerQuery);

      case 'missing-erp':
        return this.api.missingErp(q as MissingErpQuery);

      case 'other-divergences':
        return this.api.otherDivergences(q as OtherDivergencesQuery);
    }
  }

  private calculateTotalsByView(view: ConciliationErpVsAcquirerView, q: ConciliationQuery) {
    switch (view) {
      case 'missing-acquirer':
        return this.api.missingAcquirerCalculateTotals(q as MissingAcquirerQuery);

      case 'missing-erp':
        return this.api.missingErpCalculateTotals(q as MissingErpQuery);

      case 'other-divergences':
        return this.api.otherDivergencesCalculateTotals(q as OtherDivergencesQuery);
    }
  }

  private showReconciliationResultToast(result: ReconcileErpAcquirerResultModel): void {
    const summary = this.i18n.tUi('conciliation.reconciliationFinalizedTitle');
    const detail = this.buildReconciliationToastDetail(result);
    const life = 9000;

    if (this.hasReconciliationUpdates(result)) {
      this.toast.success(summary, detail, life);
      return;
    }

    if (this.hasReconciliationWarnings(result)) {
      this.toast.warn(summary, detail, life);
      return;
    }

    this.toast.info(summary, detail, life);
  }

  private buildReconciliationToastDetail(result: ReconcileErpAcquirerResultModel): string {
    return [
      `${this.i18n.tUi('conciliation.result.analyzed')}: ${this.formatInteger(result.analyzed)}`,
      `${this.i18n.tUi('conciliation.result.matched')}: ${this.formatInteger(result.matched)}`,
      `${this.i18n.tUi('conciliation.result.updated')}: ${this.formatInteger(result.updated)}`,
      `${this.i18n.tUi('conciliation.result.notMatched')}: ${this.formatInteger(result.notMatched)}`,
      `${this.i18n.tUi('conciliation.result.flagUpdated')}: ${this.formatInteger(result.flagUpdated)}`,
      `${this.i18n.tUi('conciliation.result.skippedDivergent')}: ${this.formatInteger(result.skippedDivergent)}`,
      `${this.i18n.tUi('conciliation.result.ambiguousMatches')}: ${this.formatInteger(result.ambiguousMatches)}`,
      `${this.i18n.tUi('conciliation.result.valueDivergences')}: ${this.formatInteger(result.valueDivergences)}`,
      `${this.i18n.tUi('conciliation.result.acquirerDivergences')}: ${this.formatInteger(result.acquirerDivergences)}`,
      `${this.i18n.tUi('conciliation.result.businessContextUpdated')}: ${this.formatInteger(result.businessContextUpdated)}`,
    ].join(' • ');
  }

  private hasReconciliationUpdates(result: ReconcileErpAcquirerResultModel): boolean {
    return (
      result.updated > 0 ||
      result.matched > 0 ||
      result.flagUpdated > 0 ||
      result.businessContextUpdated > 0
    );
  }

  private hasReconciliationWarnings(result: ReconcileErpAcquirerResultModel): boolean {
    return (
      result.skippedDivergent > 0 ||
      result.ambiguousMatches > 0 ||
      result.valueDivergences > 0 ||
      result.acquirerDivergences > 0
    );
  }

  private formatInteger(value: number | null | undefined): string {
    return new Intl.NumberFormat(this.i18n.getLocale()).format(value ?? 0);
  }
}
