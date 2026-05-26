import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';
import { HalPagedResponse } from '@core/api/page.model';
import { PageResponse } from '@models/file-processing.models';
import {
  BankSettlementAnalysisModel,
  ChargebackAnalysisModel,
  ConciliationAgingModel,
  ConciliationDashboardModel,
  ConciliationFeeAnalysisModel,
  ConciliationPageQuery,
  DebitAnalysisModel,
  DivergenceAnalysisModel,
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

  listDebits(query: ConciliationPageQuery = {}): Observable<PageResponse<DebitAnalysisModel>> {
    return this.http.get<PageResponse<DebitAnalysisModel>>(`${this.baseUrl}/debits`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listChargebacks(
    query: ConciliationPageQuery = {},
  ): Observable<PageResponse<ChargebackAnalysisModel>> {
    return this.http.get<PageResponse<ChargebackAnalysisModel>>(`${this.baseUrl}/chargebacks`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listBankSettlement(
    query: ConciliationPageQuery = {},
  ): Observable<PageResponse<BankSettlementAnalysisModel>> {
    return this.http.get<PageResponse<BankSettlementAnalysisModel>>(
      `${this.baseUrl}/bank-settlement`,
      {
        params: this.toParams(query),
        withCredentials: true,
      },
    );
  }

  listDivergences(
    query: ConciliationPageQuery = {},
  ): Observable<PageResponse<DivergenceAnalysisModel>> {
    return this.http.get<PageResponse<DivergenceAnalysisModel>>(`${this.baseUrl}/divergences`, {
      params: this.toParams(query),
      withCredentials: true,
    });
  }

  listAging(query: ConciliationPageQuery = {}): Observable<ConciliationAgingModel[]> {
    return this.http.get<ConciliationAgingModel[]>(`${this.baseUrl}/aging`, {
      params: this.toParams(query),
      withCredentials: true,
    });
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
