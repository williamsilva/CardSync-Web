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
    return this.http
      .post<any>(`${this.baseUrl}/unreconciled`, { withCredentials: true })
      .pipe(map(mapAuditUnreconciledModel));
  }
}
