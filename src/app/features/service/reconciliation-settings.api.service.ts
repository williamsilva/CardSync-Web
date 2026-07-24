import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

export interface ReconciliationSettingsModel {
  erpAcquirerPreviousDaysLookback: number;
  erpAcquirerFutureDaysLookback: number;
  reconciliationLookbackMonths: number;
  creditOrderPendingDays: number;
  // Flags de habilitação de etapas — ordem = esteira de conciliação
  enabledErpAcquirer: boolean;
  enabledSalesSummaryTransactions: boolean;
  enabledAcquirerSaleCancellations: boolean;
  enabledErpAcquirerFees: boolean;
  enabledAcquirerSaleSummary: boolean;
  enabledSalesSummaryCreditOrder: boolean;
  enabledBankAcquirer: boolean;
  // Flags de reprocessamento — ordem = esteira de conciliação
  reprocessErpAcquirerSales: boolean;
  reprocessSalesSummaryTransactions: boolean;
  reprocessAcquirerSaleCancellations: boolean;
  reprocessErpAcquirerFees: boolean;
  reprocessAcquirerSaleSummary: boolean;
  reprocessSalesSummaryCreditOrder: boolean;
  reprocessBankAcquirer: boolean;
  // Parâmetros de tolerância
  dateToleranceDaysBefore: number;
  dateToleranceDaysAfter: number;
  valueTolerance: number;
  bankMarkNotReconciledAfterDays: number;
  /** Teto de centavos para o subset-sum por programação dinâmica (Etapa 7). */
  subsetDpMaxCents: number;
  // Rigidez do matching Banco x Ordem de Crédito / Parcela (Etapa 7)
  flagMatchRequired: boolean;
  establishmentMatchRequired: boolean;
  paymentKindMatchRequired: boolean;
  // Implantação e marcação de lançamentos como legado
  goLiveDate: string | null;
  legacyMarkingMonths: number;
  /** Go-live + meses: lançamentos com data de lançamento até esta data podem ser marcados como legado. */
  legacyMarkingCutoffDate: string | null;
}

export interface ReconciliationSettingsRequest {
  erpAcquirerPreviousDaysLookback: number;
  erpAcquirerFutureDaysLookback: number;
  reconciliationLookbackMonths: number;
  creditOrderPendingDays: number;
  // Flags de habilitação de etapas — ordem = esteira de conciliação
  enabledErpAcquirer: boolean;
  enabledSalesSummaryTransactions: boolean;
  enabledAcquirerSaleCancellations: boolean;
  enabledErpAcquirerFees: boolean;
  enabledAcquirerSaleSummary: boolean;
  enabledSalesSummaryCreditOrder: boolean;
  enabledBankAcquirer: boolean;
  // Flags de reprocessamento — ordem = esteira de conciliação
  reprocessErpAcquirerSales: boolean;
  reprocessSalesSummaryTransactions: boolean;
  reprocessAcquirerSaleCancellations: boolean;
  reprocessErpAcquirerFees: boolean;
  reprocessAcquirerSaleSummary: boolean;
  reprocessSalesSummaryCreditOrder: boolean;
  reprocessBankAcquirer: boolean;
  // Parâmetros de tolerância
  dateToleranceDaysBefore: number;
  dateToleranceDaysAfter: number;
  valueTolerance: number;
  bankMarkNotReconciledAfterDays: number;
  subsetDpMaxCents: number;
  // Rigidez do matching Banco x Ordem de Crédito / Parcela (Etapa 7)
  flagMatchRequired: boolean;
  establishmentMatchRequired: boolean;
  paymentKindMatchRequired: boolean;
  // Implantação e marcação de lançamentos como legado
  goLiveDate: string;
  legacyMarkingMonths: number;
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
