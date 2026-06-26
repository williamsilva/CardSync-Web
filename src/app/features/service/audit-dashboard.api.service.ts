import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { AcquirerApiService } from './acquirer.api.service';
import {
  AuditSalesSummaryModel,
  AuditUnreconciledModel,
  mapAuditSalesSummaryModel,
  mapAuditUnreconciledModel,
} from '@models/audit-dashboard.models';

const CNPJ_REDE = '01425787000104';

@Injectable({ providedIn: 'root' })
export class AuditDashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly acquirerApi = inject(AcquirerApiService);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/management/dashboard-audit`;

  getSalesSummary(): Observable<AuditSalesSummaryModel> {
    return this.http
      .get<any>(`${this.baseUrl}/sales-summary`, { withCredentials: true })
      .pipe(map(mapAuditSalesSummaryModel));
  }

  getUnreconciled(): Observable<AuditUnreconciledModel> {
    return this.acquirerApi.getOptions().pipe(
      switchMap((res) => {
        const acquirer = (res._embedded?.content ?? []).find((a) => a.cnpj === CNPJ_REDE);
        const acquirers = acquirer ? [acquirer.id] : [];
        const body = { advanced: { acquirers } };
        return this.http
          .post<any>(`${this.baseUrl}/unreconciled`, body, { withCredentials: true })
          .pipe(map(mapAuditUnreconciledModel));
      }),
    );
  }
}
