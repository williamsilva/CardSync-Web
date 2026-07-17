import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ConciliationWaitingAdvancedFilters } from '@features/filter/conciliation-waiting.filter';
import {
  ErpAcquirerTruthSource,
  ErpUpdateIdentityRequest,
  ConciliationWaitingModel,
  ReconcileFeesResultModel,
  ReconcileBankResultModel,
  ErpAcquirerComparisonModel,
  ConciliationWaitingApiModel,
  ErpCancellationReprocessResult,
  ErpCancellationReprocessRequest,
  ReconcileErpAcquirerResultModel,
  mapConciliationWaitingApiModels,
  ErpAcquirerResolutionResultModel,
  ErpAcquirerBatchResolutionResultModel,
  ReconcileSalesSummaryCreditOrderResultModel,
  ReconcileSalesSummaryTransactionsResultModel,
  ReconcileAcquirerSaleSummaryResultModel,
} from '@models/conciliation-waiting.model';

@Injectable({ providedIn: 'root' })
export class ConciliationWaitingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/conciliation-waiting`;

  missingAcquirer(body: ListQueryDto<ConciliationWaitingAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<ConciliationWaitingApiModel>>(`${this.baseUrl}/missing-acquirer`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapConciliationWaitingApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<ConciliationWaitingModel>,
        ),
      );
  }

  missingErp(body: ListQueryDto<ConciliationWaitingAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<ConciliationWaitingApiModel>>(`${this.baseUrl}/missing-erp`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapConciliationWaitingApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<ConciliationWaitingModel>,
        ),
      );
  }

  otherDivergences(body: ListQueryDto<ConciliationWaitingAdvancedFilters>) {
    return this.http
      .post<
        HalPagedResponse<ConciliationWaitingApiModel>
      >(`${this.baseUrl}/other-divergences`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapConciliationWaitingApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<ConciliationWaitingModel>,
        ),
      );
  }

  missingAcquirerCalculateTotals(body: ListQueryDto<ConciliationWaitingAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/missing-acquirer-totals`, body);
  }

  missingErpCalculateTotals(body: ListQueryDto<ConciliationWaitingAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/missing-erp-totals`, body);
  }

  otherDivergencesCalculateTotals(body: ListQueryDto<ConciliationWaitingAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(
      `${this.baseUrl}/other-divergences-totals`,
      body,
    );
  }

  createErpFromAcquirer(
    acquirerTransactionId: string,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.http.post<ErpAcquirerResolutionResultModel>(
      `${this.baseUrl}/acquirer/${acquirerTransactionId}/create-erp`,
      {},
      { withCredentials: true },
    );
  }

  updateErpIdentity(
    erpTransactionId: string,
    request: ErpUpdateIdentityRequest,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.http.patch<ErpAcquirerResolutionResultModel>(
      `${this.baseUrl}/erp/${erpTransactionId}/update-identity`,
      request,
      { withCredentials: true },
    );
  }

  markErpAsDeleted(
    erpTransactionId: string,
    reason: string,
    observations: string,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.http.post<ErpAcquirerResolutionResultModel>(
      `${this.baseUrl}/erp/${erpTransactionId}/mark-deleted`,
      { reason, observations },
      { withCredentials: true },
    );
  }

  createErpFromAcquirerBatch(
    acquirerTransactionIds: string[],
  ): Observable<ErpAcquirerBatchResolutionResultModel> {
    return this.http.post<ErpAcquirerBatchResolutionResultModel>(
      `${this.baseUrl}/acquirer/create-erp-batch`,
      { transactionIds: acquirerTransactionIds },
      { withCredentials: true },
    );
  }

  markErpAsDeletedBatch(
    erpTransactionIds: string[],
    reason: string,
    observations: string,
  ): Observable<ErpAcquirerBatchResolutionResultModel> {
    return this.http.post<ErpAcquirerBatchResolutionResultModel>(
      `${this.baseUrl}/erp/mark-deleted-batch`,
      { transactionIds: erpTransactionIds, reason, observations },
      { withCredentials: true },
    );
  }

  compareErpVsAcquirer(
    erpTransactionId: string,
    acquirerTransactionId: string,
  ): Observable<ErpAcquirerComparisonModel> {
    return this.http.get<ErpAcquirerComparisonModel>(`${this.baseUrl}/compare`, {
      params: new HttpParams()
        .set('erpTransactionId', erpTransactionId)
        .set('acquirerTransactionId', acquirerTransactionId),
      withCredentials: true,
    });
  }

  reconcileErpVsAcquirerManually(
    erpTransactionId: string,
    acquirerTransactionId: string,
    truthSource: ErpAcquirerTruthSource,
  ): Observable<ErpAcquirerResolutionResultModel> {
    return this.http.post<ErpAcquirerResolutionResultModel>(
      `${this.baseUrl}/reconcile-manually`,
      {},
      {
        params: new HttpParams()
          .set('erpTransactionId', erpTransactionId)
          .set('acquirerTransactionId', acquirerTransactionId)
          .set('truthSource', truthSource),
        withCredentials: true,
      },
    );
  }

  reconcileErpVsAcquirer(): Observable<ReconcileErpAcquirerResultModel> {
    return this.http.post<ReconcileErpAcquirerResultModel>(
      `${this.baseUrl}/reconcile`,
      {},
      { withCredentials: true },
    );
  }

  reconcileManualSwapped(): Observable<ReconcileErpAcquirerResultModel> {
    return this.http.post<ReconcileErpAcquirerResultModel>(
      `${this.baseUrl}/reconcile-manual-swapped`,
      {},
      { withCredentials: true },
    );
  }

  reconcileFees(): Observable<ReconcileFeesResultModel> {
    return this.http.post<ReconcileFeesResultModel>(
      `${this.baseUrl}/reconcile-fees`,
      {},
      { withCredentials: true },
    );
  }

  reconcilingBank(): Observable<ReconcileBankResultModel> {
    return this.http.post<ReconcileBankResultModel>(
      `${this.baseUrl}/reconcile-bank`,
      {},
      { withCredentials: true },
    );
  }

  reprocessErpCancellations(
    request: ErpCancellationReprocessRequest,
  ): Observable<ErpCancellationReprocessResult> {
    return this.http.post<ErpCancellationReprocessResult>(
      `${this.baseUrl}/reprocess-erp-cancellations`,
      request,
      { withCredentials: true },
    );
  }

  reconcileSalesSummaryCreditOrder(): Observable<ReconcileSalesSummaryCreditOrderResultModel> {
    return this.http.post<ReconcileSalesSummaryCreditOrderResultModel>(
      `${this.baseUrl}/reconcile-sales-summary-credit-order`,
      {},
      { withCredentials: true },
    );
  }

  // TODO: remover ignoreLookback após o backfill único dos resumos antigos (ver
  // reconciliation-actions.component.*) — foi adicionado só para expor o parâmetro do
  // backend numa chamada manual, não é para virar comportamento permanente da tela.
  reconcileSalesSummaryTransactions(
    ignoreLookback = false,
  ): Observable<ReconcileSalesSummaryTransactionsResultModel> {
    return this.http.post<ReconcileSalesSummaryTransactionsResultModel>(
      `${this.baseUrl}/reconcile-sales-summary-transactions`,
      {},
      {
        params: new HttpParams().set('ignoreLookback', ignoreLookback),
        withCredentials: true,
      },
    );
  }

  reconcileAcquirerSaleSummary(): Observable<ReconcileAcquirerSaleSummaryResultModel> {
    return this.http.post<ReconcileAcquirerSaleSummaryResultModel>(
      `${this.baseUrl}/reconcile-acquirer-sale-summary`,
      {},
      { withCredentials: true },
    );
  }
}
