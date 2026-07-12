import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '@core/api/api.config';

export interface ManualBankReconciliationRequest {
  releaseBankId: string;
  creditOrderIds: string[];
}

export interface ManualBankReconciliationResult {
  reconciled: number;
  alreadyReconciled: number;
  zeroValueReconciled: number;
}

export interface MarkLegacyResult {
  updated: number;
  skipped: number;
}

@Injectable({ providedIn: 'root' })
export class ManualBankReconciliationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/bank-reconciliation`;

  reconcile(request: ManualBankReconciliationRequest): Observable<ManualBankReconciliationResult> {
    return this.http.post<ManualBankReconciliationResult>(`${this.baseUrl}/manual`, request);
  }

  markLegacy(releaseBankIds: string[]): Observable<MarkLegacyResult> {
    return this.http.post<MarkLegacyResult>(`${this.baseUrl}/legacy`, { releaseBankIds });
  }
}
