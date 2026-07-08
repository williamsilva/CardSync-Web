import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map, Observable } from 'rxjs';

import { environment } from 'environments/environment';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ProcessedFilesAdvancedFilters } from '@features/filter/processed-files.filters';
import {
  PageQuery,
  PageResponse,
  ProcessedFileModel,
  ErpPendingSaleModel,
  ProcessedFileApiModel,
  ScheduleStatusResponse,
  ProcessedFileErrorModel,
  ProcessedFileSummaryModel,
  ImportedFileCalendarModel,
  FileProcessingTotalsModel,
  mapProcessedFilesApiModels,
  ReprocessPendingErpResultModel,
  ReconciliationExecutionLogModel,
  FinancialReconciliationPipelineResultModel,
} from '../models/file-processing.models';

@Injectable({ providedIn: 'root' })
export class FileProcessingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/file-processing`;

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

  getImportedFilesCalendar(month: string): Observable<ImportedFileCalendarModel> {
    return this.http.get<ImportedFileCalendarModel>(`${this.baseUrl}/files/calendar`, {
      params: { month },
      withCredentials: true,
    });
  }

  processErp(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/erp/process`, {}, { withCredentials: true });
  }

  processRede(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/rede/process`, {}, { withCredentials: true });
  }

  searchFilesPaged(body: ListQueryDto<ProcessedFilesAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<ProcessedFileApiModel>>(`${this.baseUrl}/files/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapProcessedFilesApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<ProcessedFileApiModel>,
        ),
      );
  }

  processBank(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/bank/process`, {}, { withCredentials: true });
  }

  runFinancialPipeline(): Observable<FinancialReconciliationPipelineResultModel> {
    return this.http.post<FinancialReconciliationPipelineResultModel>(
      `${environment.bffBaseUrl}/bff/v1/conciliation/financial-pipeline/run`,
      {},
      { withCredentials: true },
    );
  }

  getReconciliationHistory(limit = 20): Observable<ReconciliationExecutionLogModel[]> {
    return this.http.get<ReconciliationExecutionLogModel[]>(
      `${environment.bffBaseUrl}/bff/v1/conciliation/financial-pipeline/history`,
      { params: { limit }, withCredentials: true },
    );
  }

  getFilesTotals(
    filters: Partial<ProcessedFilesAdvancedFilters> = {},
  ): Observable<FileProcessingTotalsModel> {
    return this.http.post<FileProcessingTotalsModel>(`${this.baseUrl}/files/totals`, filters, {
      withCredentials: true,
    });
  }

  listPendingErpSales(query: PageQuery = {}): Observable<PageResponse<ErpPendingSaleModel>> {
    return this.http.get<PageResponse<ErpPendingSaleModel>>(`${this.baseUrl}/erp/pending-sales`, {
      params: this.toParams(query),
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

  listRedeTotalizers(query: PageQuery = {}): Observable<PageResponse<any>> {
    return this.http.get<PageResponse<any>>(`${this.baseUrl}/rede/totalizers`, {
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
