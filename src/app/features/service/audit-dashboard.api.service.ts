import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import {
  AuditSalesSummaryModel,
  AuditUnreconciledModel,
  mapAuditSalesSummaryModel,
  mapAuditUnreconciledModel,
} from '@models/audit-dashboard.models';

@Injectable({ providedIn: 'root' })
export class AuditDashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/management/dashboard-audit`;

  getSalesSummary(): Observable<AuditSalesSummaryModel> {
    return this.http
      .get<any>(`${this.baseUrl}/sales-summary`, { withCredentials: true })
      .pipe(map(mapAuditSalesSummaryModel));
  }

  getUnreconciled(): Observable<AuditUnreconciledModel> {
    const body = { advanced: { acquirers: ['d9ddefbf-6679-11f1-a594-02004c4f4f50'] } };
    return this.http
      .post<any>(`${this.baseUrl}/unreconciled`, body, { withCredentials: true })
      .pipe(map(mapAuditUnreconciledModel));
  }
}
