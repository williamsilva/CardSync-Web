import { Injectable, inject, signal } from '@angular/core';

import { Observable, finalize, tap } from 'rxjs';

import { I18nService } from '@core/i18n/i18n.service';
import { ToastService } from '@core/toast/toast.service';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ConciliationWaitingAdvancedFilters } from '@features/filter/conciliation-waiting.filter';
import { ConciliationWaitingApiService } from '@features/service/conciliation-waiting.api.service';
import {
  ErpAcquirerTruthSource,
  ErpUpdateIdentityRequest,
  ConciliationWaitingModel,
  ReconcileFeesResultModel,
  ReconcileBankResultModel,
  ErpAcquirerComparisonModel,
  ErpCancellationReprocessResult,
  ErpCancellationReprocessRequest,
  ReconcileErpAcquirerResultModel,
  ErpAcquirerResolutionResultModel,
  ErpAcquirerBatchResolutionResultModel,
  ReconcileSalesSummaryCreditOrderResultModel,
  ReconcileSalesSummaryTransactionsResultModel,
  ReconcileAcquirerSaleSummaryResultModel,
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
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ConciliationWaitingApiService);

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

  updateErpIdentity(
    erpTransactionId: string,
    request: ErpUpdateIdentityRequest,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.api.updateErpIdentity(erpTransactionId, request);
  }

  markErpAsDeleted(
    erpTransactionId: string,
    reason: string,
    observations: string,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.api
      .markErpAsDeleted(erpTransactionId, reason, observations)
      .pipe(tap(() => this.clearTotals()));
  }

  markErpAsDeletedBatch(
    erpTransactionIds: string[],
    reason: string,
    observations: string,
  ): Observable<ErpAcquirerBatchResolutionResultModel> {
    return this.api
      .markErpAsDeletedBatch(erpTransactionIds, reason, observations)
      .pipe(tap(() => this.clearTotals()));
  }

  reconcileErpVsAcquirer(): Observable<ReconcileErpAcquirerResultModel> {
    return this.api.reconcileErpVsAcquirer().pipe(
      tap((result) => {
        //this.showReconciliationResultErpAcquirerToast(result);
      }),
    );
  }

  reconcileManualSwapped(): Observable<ReconcileErpAcquirerResultModel> {
    return this.api.reconcileManualSwapped().pipe(
      tap((result) => {
        //this.showReconciliationResultErpAcquirerToast(result);
      }),
    );
  }

  reconcileFees(): Observable<ReconcileFeesResultModel> {
    return this.api.reconcileFees().pipe(
      tap((result) => {
        //this.showReconciliationResultFeesToast(result);
      }),
    );
  }

  reconcilingBank(): Observable<ReconcileBankResultModel> {
    return this.api.reconcilingBank().pipe(
      tap((result) => {
        // this.showReconciliationResultFeesToast(result);
      }),
    );
  }

  reprocessErpCancellations(
    request: ErpCancellationReprocessRequest,
  ): Observable<ErpCancellationReprocessResult> {
    return this.api.reprocessErpCancellations(request).pipe(
      tap((result) => {
        //this.showCancellationReprocessToast(result)
      }),
    );
  }

  reconcileSalesSummaryCreditOrder(): Observable<ReconcileSalesSummaryCreditOrderResultModel> {
    return this.api.reconcileSalesSummaryCreditOrder().pipe(
      tap((result) => {
        // this.showSalesSummaryCreditOrderToast(result)
      }),
    );
  }

  reconcileSalesSummaryTransactions(): Observable<ReconcileSalesSummaryTransactionsResultModel> {
    return this.api.reconcileSalesSummaryTransactions();
  }

  reconcileAcquirerSaleSummary(): Observable<ReconcileAcquirerSaleSummaryResultModel> {
    return this.api.reconcileAcquirerSaleSummary();
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

  private showReconciliationResultFeesToast(result: ReconcileFeesResultModel): void {
    const summary = this.i18n.tUi('conciliation.reconciliationFinalizedTitle');
    const detail = this.buildReconciliationFeesToastDetail(result);
    const life = 9000;

    if (this.hasReconciliationFeesUpdates(result)) {
      this.toast.success(summary, detail, life);
      return;
    }

    if (this.hasReconciliationFeesWarnings(result)) {
      this.toast.warn(summary, detail, life);
      return;
    }

    this.toast.info(summary, detail, life);
  }

  private showReconciliationResultErpAcquirerToast(result: ReconcileErpAcquirerResultModel): void {
    const summary = this.i18n.tUi('conciliation.reconciliationFinalizedTitle');
    const detail = this.buildReconciliationErpAcquirerToastDetail(result);
    const life = 9000;

    if (this.hasReconciliationErpAcquirerUpdates(result)) {
      this.toast.success(summary, detail, life);
      return;
    }

    if (this.hasReconciliationErpAcquirerWarnings(result)) {
      this.toast.warn(summary, detail, life);
      return;
    }

    this.toast.info(summary, detail, life);
  }

  private buildReconciliationErpAcquirerToastDetail(
    result: ReconcileErpAcquirerResultModel,
  ): string {
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

  private buildReconciliationFeesToastDetail(result: ReconcileFeesResultModel): string {
    return [
      `${this.i18n.tUi('conciliation.result.okRates')}: ${this.formatInteger(result.okRates)}`,
      `${this.i18n.tUi('conciliation.result.analyzed')}: ${this.formatInteger(result.analyzed)}`,
      `${this.i18n.tUi('conciliation.result.divergentRates')}: ${this.formatInteger(result.divergentRates)}`,
      `${this.i18n.tUi('conciliation.result.updatedErpSales')}: ${this.formatInteger(result.updatedErpSales)}`,
      `${this.i18n.tUi('conciliation.result.missingValidContracts')}: ${this.formatInteger(result.missingValidContracts)}`,
      `${this.i18n.tUi('conciliation.result.skippedWithoutAcquire')}: ${this.formatInteger(result.skippedWithoutAcquire)}`,
    ].join(' • ');
  }

  private hasReconciliationErpAcquirerUpdates(result: ReconcileErpAcquirerResultModel): boolean {
    return (
      result.updated > 0 ||
      result.matched > 0 ||
      result.flagUpdated > 0 ||
      result.businessContextUpdated > 0
    );
  }

  private hasReconciliationErpAcquirerWarnings(result: ReconcileErpAcquirerResultModel): boolean {
    return (
      result.skippedDivergent > 0 ||
      result.ambiguousMatches > 0 ||
      result.valueDivergences > 0 ||
      result.acquirerDivergences > 0
    );
  }

  private hasReconciliationFeesUpdates(result: ReconcileFeesResultModel): boolean {
    return result.analyzed > 0 || result.okRates > 0 || result.updatedErpSales > 0;
  }

  private hasReconciliationFeesWarnings(result: ReconcileFeesResultModel): boolean {
    return (
      result.skippedWithoutAcquire > 0 ||
      result.divergentRates > 0 ||
      result.missingValidContracts > 0
    );
  }

  private showSalesSummaryCreditOrderToast(
    result: ReconcileSalesSummaryCreditOrderResultModel,
  ): void {
    const summary = this.i18n.tUi('conciliation.reconciliationFinalizedTitle');
    const detail = [
      `${this.i18n.tUi('conciliation.result.analyzed')}: ${this.formatInteger(result.summariesAnalyzed)}`,
      `${this.i18n.tUi('conciliation.result.matched')}: ${this.formatInteger(result.summariesReconciled)}`,
      `${this.i18n.tUi('conciliation.result.partiallyReconciled')}: ${this.formatInteger(result.summariesPartiallyReconciled)}`,
      `${this.i18n.tUi('conciliation.result.pending')}: ${this.formatInteger(result.summariesPending)}`,
      `${this.i18n.tUi('conciliation.result.generatedCreditOrders')}: ${this.formatInteger(result.generatedCreditOrders)}`,
    ].join(' • ');
    const life = 9000;

    if (result.summariesReconciled > 0 || result.generatedCreditOrders > 0) {
      this.toast.success(summary, detail, life);
    } else if (result.summariesPending > 0 || result.summariesWithoutCreditOrders > 0) {
      this.toast.warn(summary, detail, life);
    } else {
      this.toast.info(summary, detail, life);
    }
  }

  private showCancellationReprocessToast(result: ErpCancellationReprocessResult): void {
    this.toast.success(
      this.i18n.tUi('conciliation.cancellationReprocess.successTitle'),
      this.i18n.tUi('conciliation.cancellationReprocess.successDetail', {
        acq: result.acqSalesCancelled,
        erp: result.erpSalesCancelled,
        linked: result.erpLinkedBeforeCancel,
        installments: result.erpInstallmentsCancelled,
        skipped: result.skippedAlreadyCancelled,
      }),
      12000,
    );
  }

  private formatInteger(value: number | null | undefined): string {
    return new Intl.NumberFormat(this.i18n.getLocale()).format(value ?? 0);
  }
}
