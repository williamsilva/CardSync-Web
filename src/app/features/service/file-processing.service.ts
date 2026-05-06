import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  BankReconciliationResultModel,
  BankReleaseModel,
  ErpPendingSaleModel,
  FileProcessingDashboardModel,
  FileProcessingDivergenceContextModel,
  PageQuery,
  PageResponse,
  ProcessedFileErrorModel,
  ProcessedFileModel,
  ProcessedFileSummaryModel,
  RedeAdjustmentModel,
  RedeAnticipationModel,
  RedeCreditOrderModel,
  RedePendingDebtModel,
  RedeSettledDebtModel,
  RedeTotalizerModel,
  ReprocessPendingErpResultModel,
  ScheduleStatusResponse,
} from '../models/file-processing.models';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class FileProcessingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/file-processing`;

  listFiles(query: PageQuery = {}): Observable<PageResponse<ProcessedFileModel>> {
    return this.http.get<PageResponse<ProcessedFileModel>>(`${this.baseUrl}/files`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  getFile(id: string): Observable<ProcessedFileModel> {
    return this.http.get<ProcessedFileModel>(`${this.baseUrl}/files/${id}`, {
      withCredentials: true,
    });
  }

  getFileSummary(id: string): Observable<ProcessedFileSummaryModel> {
    return this.http.get<ProcessedFileSummaryModel>(`${this.baseUrl}/files/${id}/summary`, {
      withCredentials: true,
    });
  }

  listFileErrors(id: string): Observable<ProcessedFileErrorModel[]> {
    return this.http.get<ProcessedFileErrorModel[]>(`${this.baseUrl}/files/${id}/errors`, {
      withCredentials: true,
    });
  }

  getScheduleStatus(): Observable<ScheduleStatusResponse> {
    return this.http.get<ScheduleStatusResponse>(`${this.baseUrl}/schedules/status`, {
      withCredentials: true,
    });
  }

  processErp(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/erp/process`, {}, { withCredentials: true });
  }

  processRede(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/rede/process`, {}, { withCredentials: true });
  }

  processBank(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bank/process`, {}, { withCredentials: true });
  }

  reconcileBank(): Observable<BankReconciliationResultModel> {
    return this.http.post<BankReconciliationResultModel>(
      `${this.baseUrl}/bank/reconcile`,
      {},
      { withCredentials: true },
    );
  }

  getDashboard(): Observable<FileProcessingDashboardModel> {
    return this.http.get<FileProcessingDashboardModel>(`${this.baseUrl}/dashboard`, {
      withCredentials: true,
    });
  }

  listDashboardDivergences(): Observable<FileProcessingDivergenceContextModel[]> {
    return this.http.get<FileProcessingDivergenceContextModel[]>(
      `${this.baseUrl}/dashboard/divergences`,
      { withCredentials: true },
    );
  }

  listPendingErpSales(query: PageQuery = {}): Observable<PageResponse<ErpPendingSaleModel>> {
    return this.http.get<PageResponse<ErpPendingSaleModel>>(`${this.baseUrl}/erp/pending-sales`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  getPendingErpSale(id: string): Observable<ErpPendingSaleModel> {
    return this.http.get<ErpPendingSaleModel>(`${this.baseUrl}/erp/pending-sales/${id}`, {
      withCredentials: true,
    });
  }

  reprocessPendingErpSales(): Observable<ReprocessPendingErpResultModel> {
    return this.http.post<ReprocessPendingErpResultModel>(
      `${this.baseUrl}/erp/reprocess-pending`,
      {},
      { withCredentials: true },
    );
  }

  listRedeCreditOrders(query: PageQuery = {}): Observable<PageResponse<RedeCreditOrderModel>> {
    return this.http.get<PageResponse<RedeCreditOrderModel>>(`${this.baseUrl}/rede/credit-orders`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listRedeAdjustments(query: PageQuery = {}): Observable<PageResponse<RedeAdjustmentModel>> {
    return this.http.get<PageResponse<RedeAdjustmentModel>>(`${this.baseUrl}/rede/adjustments`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listRedeAnticipations(query: PageQuery = {}): Observable<PageResponse<RedeAnticipationModel>> {
    return this.http.get<PageResponse<RedeAnticipationModel>>(
      `${this.baseUrl}/rede/anticipations`,
      {
        params: this.toParams(query),
        withCredentials: true,
      },
    );
  }

  listRedeSettledDebts(query: PageQuery = {}): Observable<PageResponse<RedeSettledDebtModel>> {
    return this.http.get<PageResponse<RedeSettledDebtModel>>(`${this.baseUrl}/rede/settled-debts`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listRedePendingDebts(query: PageQuery = {}): Observable<PageResponse<RedePendingDebtModel>> {
    return this.http.get<PageResponse<RedePendingDebtModel>>(`${this.baseUrl}/rede/pending-debts`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listRedeTotalizers(query: PageQuery = {}): Observable<PageResponse<RedeTotalizerModel>> {
    return this.http.get<PageResponse<RedeTotalizerModel>>(`${this.baseUrl}/rede/totalizers`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listBankReleases(query: PageQuery = {}): Observable<PageResponse<BankReleaseModel>> {
    return this.http.get<PageResponse<BankReleaseModel>>(`${this.baseUrl}/bank/releases`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  private toParams(query: PageQuery): HttpParams {
    let params = new HttpParams();

    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.size !== undefined) params = params.set('size', query.size);
    if (query.sort) params = params.set('sort', query.sort);

    return params;
  }
}
