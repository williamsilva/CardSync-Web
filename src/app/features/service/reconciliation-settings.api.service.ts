import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

export interface ReconciliationSettingsModel {
  erpAcquirerPreviousDaysLookback: number;
  erpAcquirerFutureDaysLookback: number;
  reconciliationLookbackMonths: number;
}

export interface ReconciliationSettingsRequest {
  erpAcquirerPreviousDaysLookback: number;
  erpAcquirerFutureDaysLookback: number;
  reconciliationLookbackMonths: number;
}

@Injectable({ providedIn: 'root' })
export class ReconciliationSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/reconciliation/settings`;

  getSettings(): Observable<ReconciliationSettingsModel> {
    return this.http.get<ReconciliationSettingsModel>(this.baseUrl, { withCredentials: true });
  }

  updateSettings(request: ReconciliationSettingsRequest): Observable<ReconciliationSettingsModel> {
    return this.http.put<ReconciliationSettingsModel>(this.baseUrl, request, {
      withCredentials: true,
    });
  }
}
