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

export interface ReclassifyBankStatementAcquirerResult {
  analyzed: number;
  updated: number;
  stillUnresolved: number;
}

export interface PreImplantationDivergenceCandidate {
  releaseBankId: string;
  companyName: string | null;
  acquirerName: string | null;
  releaseDate: string;
  releaseValue: number;
  matchedOrders: number;
  sumOrders: number;
  difference: number;
}

export interface PreImplantationDivergencePreviewResult {
  analyzed: number;
  eligibleToLink: number;
  skippedNegativeDifference: number;
  skippedNoCandidates: number;
  candidates: PreImplantationDivergenceCandidate[];
}

export interface PreImplantationDivergenceApplyResult {
  analyzed: number;
  linked: number;
  skippedNegativeDifference: number;
  skippedNoCandidates: number;
}

export interface NoCreditOrderLegacyCandidate {
  releaseBankId: string;
  companyName: string | null;
  acquirerName: string | null;
  releaseDate: string;
  releaseValue: number;
}

export interface NoCreditOrderLegacyPreviewResult {
  analyzed: number;
  eligibleToMark: number;
  skippedHasCandidates: number;
  skippedOutsideLegacyWindow: number;
  candidates: NoCreditOrderLegacyCandidate[];
}

export interface NoCreditOrderLegacyApplyResult {
  analyzed: number;
  marked: number;
  skippedHasCandidates: number;
  skippedOutsideLegacyWindow: number;
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

  /**
   * Backfill único: vincula o adquirente dos lançamentos já importados sem vínculo. Rode antes
   * de reclassifyEstablishment — a resolução de estabelecimento usa o adquirente já vinculado
   * do lançamento para restringir a busca por PV.
   */
  reclassifyAcquirer(): Observable<ReclassifyBankStatementAcquirerResult> {
    return this.http.post<ReclassifyBankStatementAcquirerResult>(
      `${this.baseUrl}/reclassify-acquirer`,
      {},
    );
  }

  /** Só análise, não grava nada — lista o que previewApplyPreImplantationDivergence executaria. */
  previewPreImplantationDivergence(): Observable<PreImplantationDivergencePreviewResult> {
    return this.http.post<PreImplantationDivergencePreviewResult>(
      `${this.baseUrl}/pre-implantation-divergence/preview`,
      {},
    );
  }

  /**
   * Executa de fato: vincula com a justificativa padrão de divergência pré-implantação.
   * Sem releaseBankIds (ou lista vazia), aplica a todos os elegíveis; com a lista, restringe à
   * seleção feita na prévia.
   */
  applyPreImplantationDivergence(
    releaseBankIds?: string[],
  ): Observable<PreImplantationDivergenceApplyResult> {
    return this.http.post<PreImplantationDivergenceApplyResult>(
      `${this.baseUrl}/pre-implantation-divergence/apply`,
      { releaseBankIds: releaseBankIds?.length ? releaseBankIds : undefined },
    );
  }

  /** Só análise, não grava nada — lista o que applyNoCreditOrderLegacyMarking executaria. */
  previewNoCreditOrderLegacyMarking(): Observable<NoCreditOrderLegacyPreviewResult> {
    return this.http.post<NoCreditOrderLegacyPreviewResult>(
      `${this.baseUrl}/no-credit-order-legacy/preview`,
      {},
    );
  }

  /**
   * Executa de fato: marca como legado os lançamentos sem nenhuma ordem de crédito candidata.
   * Sem releaseBankIds (ou lista vazia), aplica a todos os elegíveis; com a lista, restringe à
   * seleção feita na prévia.
   */
  applyNoCreditOrderLegacyMarking(
    releaseBankIds?: string[],
  ): Observable<NoCreditOrderLegacyApplyResult> {
    return this.http.post<NoCreditOrderLegacyApplyResult>(
      `${this.baseUrl}/no-credit-order-legacy/apply`,
      { releaseBankIds: releaseBankIds?.length ? releaseBankIds : undefined },
    );
  }
}
