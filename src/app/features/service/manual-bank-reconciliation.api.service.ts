import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '@core/api/api.config';

export interface ManualBankReconciliationRequest {
  releaseBankId: string;
  creditOrderIds: string[];
  /** Obrigatório quando a soma das ordens não bate com o valor do lançamento. */
  divergenceReason?: string | null;
}

export interface ManualBankReconciliationResult {
  reconciled: number;
  alreadyReconciled: number;
  zeroValueReconciled: number;
  divergenceValue: number | null;
}

export interface MarkLegacyResult {
  updated: number;
  skipped: number;
}

export interface UndoBankReconciliationResult {
  creditOrdersUnlinked: number;
  installmentsUnlinked: number;
}

export interface ReclassifyBankStatementFlagsResult {
  analyzed: number;
  updated: number;
  stillUnresolved: number;
}

export interface ReclassifyBankStatementModalityResult {
  analyzed: number;
  updated: number;
  stillUnresolved: number;
}

export interface ReclassifyBankStatementEstablishmentResult {
  analyzed: number;
  updated: number;
  stillUnresolved: number;
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

  undoReconciliation(releaseBankId: string): Observable<UndoBankReconciliationResult> {
    return this.http.post<UndoBankReconciliationResult>(`${this.baseUrl}/undo/${releaseBankId}`, {});
  }

  /** Backfill único: reclassifica a bandeira dos lançamentos bancários CNAB240 já importados. */
  reclassifyFlags(): Observable<ReclassifyBankStatementFlagsResult> {
    return this.http.post<ReclassifyBankStatementFlagsResult>(
      `${this.baseUrl}/reclassify-flags`,
      {},
    );
  }

  /** Backfill único: reclassifica a modalidade (débito/crédito) dos lançamentos já importados. */
  reclassifyModality(): Observable<ReclassifyBankStatementModalityResult> {
    return this.http.post<ReclassifyBankStatementModalityResult>(
      `${this.baseUrl}/reclassify-modality`,
      {},
    );
  }

  /** Backfill único: vincula o estabelecimento dos lançamentos já importados sem vínculo. */
  reclassifyEstablishment(): Observable<ReclassifyBankStatementEstablishmentResult> {
    return this.http.post<ReclassifyBankStatementEstablishmentResult>(
      `${this.baseUrl}/reclassify-establishment`,
      {},
    );
  }
}
