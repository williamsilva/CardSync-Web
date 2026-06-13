import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from 'environments/environment';
import { HalPagedResponse } from '@core/api/page.model';
import { PageResponse } from '@models/file-processing.models';
import {
  ChargebackAnalysisFilter,
  ChargebackAnalysisModel,
  ChargebackAnalysisTotalsModel,
  ChargebackLifecycleModel,
  ConciliationAgingModel,
  ConciliationDashboardModel,
  ConciliationFeeAnalysisModel,
  ConciliationPageQuery,
} from '@models/conciliation.models';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';

@Injectable({ providedIn: 'root' })
export class ConciliationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/conciliation`;

  getDashboard(): Observable<ConciliationDashboardModel> {
    return this.http.get<ConciliationDashboardModel>(`${this.baseUrl}/dashboard`, {
      withCredentials: true,
    });
  }

  listFees(
    body: ListQueryDto<Record<string, unknown>>,
  ): Observable<HalPagedResponse<ConciliationFeeAnalysisModel>> {
    return this.http.post<HalPagedResponse<ConciliationFeeAnalysisModel>>(
      `${this.baseUrl}/fees`,
      body,
      { withCredentials: true },
    );
  }

  listChargebacks(
    body: ListQueryDto<ChargebackAnalysisFilter>,
  ): Observable<PageResponse<ChargebackAnalysisModel>> {
    return this.http
      .post<
        HalPagedResponse<ChargebackAnalysisModel> | PageResponse<ChargebackAnalysisModel>
      >(`${this.baseUrl}/chargebacks`, body, { withCredentials: true })
      .pipe(map((response) => this.normalizePage(response)));
  }

  listChargebackLifecycles(
    body: ListQueryDto<ChargebackAnalysisFilter>,
  ): Observable<PageResponse<ChargebackLifecycleModel>> {
    return this.http
      .post<
        HalPagedResponse<ChargebackLifecycleModel> | PageResponse<ChargebackLifecycleModel>
      >(`${this.baseUrl}/chargebacks-lifecycle`, body, { withCredentials: true })
      .pipe(map((response) => this.normalizePage(response)));
  }

  chargebacksTotals(
    body: ListQueryDto<ChargebackAnalysisFilter>,
  ): Observable<ChargebackAnalysisTotalsModel> {
    return this.http.post<ChargebackAnalysisTotalsModel>(
      `${this.baseUrl}/chargebacks-totals`,
      body,
      {
        withCredentials: true,
      },
    );
  }

  listAging(query: ConciliationPageQuery = {}): Observable<ConciliationAgingModel[]> {
    return this.http.get<ConciliationAgingModel[]>(`${this.baseUrl}/aging`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  private normalizePage<T>(response: HalPagedResponse<T> | PageResponse<T>): PageResponse<T> {
    if ('content' in response) {
      return response;
    }

    const content = response._embedded?.content ?? [];
    const page = response.page;
    const pageNumber = page
      ? (page.page ?? (page as unknown as { number?: number }).number ?? 0)
      : 0;

    return {
      content,
      totalElements: page?.totalElements ?? content.length,
      totalPages: page?.totalPages ?? 1,
      size: page?.size ?? content.length,
      number: pageNumber,
      first: pageNumber === 0,
      last: page ? pageNumber + 1 >= page.totalPages : true,
      numberOfElements: content.length,
      empty: content.length === 0,
    };
  }

  private toParams(query: ConciliationPageQuery): HttpParams {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
