import { PageQuery } from './file-processing.models';

export type ConciliationStatus =
  | 'PENDING'
  | 'MATCHED'
  | 'RECONCILED'
  | 'PARTIALLY_RECONCILED'
  | 'DIVERGENT'
  | 'NOT_RECONCILED'
  | 'LIQUIDATED'
  | 'PARTIALLY_LIQUIDATED'
  | 'OPEN'
  | 'WON'
  | 'LOST'
  | string;

export type FeeAnalysisStatus =
  | 'OK'
  | 'MISSING_CONTRACT'
  | 'RATE_DIVERGENCE'
  | 'VALUE_DIVERGENCE'
  | 'MISSING_ACQUIRER_SALE'
  | string;

export type ErpAcquirerComparisonStatus =
  | 'MATCHED'
  | 'MISSING_IN_ACQUIRER'
  | 'MISSING_IN_ERP'
  | 'VALUE_DIVERGENCE'
  | 'DATE_DIVERGENCE'
  | 'INSTALLMENT_DIVERGENCE'
  | 'FLAG_DIVERGENCE'
  | 'MODALITY_DIVERGENCE'
  | 'DUPLICATED'
  | string;

export type ChargebackStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'REPRESENTED'
  | 'WON'
  | 'LOST'
  | 'REVERSED'
  | 'EXPIRED'
  | string;

export type ErpVsAcquirerView = 'MISSING_ACQUIRER' | 'MISSING_ERP' | 'OTHER_DIVERGENCES';

export interface ConciliationPageQuery extends PageQuery {
  startDate?: string;
  endDate?: string;
  companyId?: string;
  establishmentId?: string;
  acquirerId?: string;
  flagId?: string;
  status?: string;
  view?: ErpVsAcquirerView | string;
  nsu?: string;
  authorization?: string;
}

export interface ConciliationChartPointModel {
  label: string;
  value: number;
  quantity?: number | null;
}

export interface ConciliationComparisonModel {
  erpAmount: number;
  acquirerAmount: number;
  differenceAmount: number;
  matchedAmount: number;
  pendingAmount: number;
}

export interface ConciliationSummaryModel {
  erpSalesQuantity: number;
  erpGrossAmount: number;
  acquirerSalesQuantity: number;
  acquirerGrossAmount: number;
  matchedSalesQuantity: number;
  matchedAmount: number;
  pendingSalesQuantity: number;
  pendingAmount: number;
  feeAmount: number;
  expectedFeeAmount: number;
  feeDifferenceAmount: number;
  bankSettledAmount: number;
  bankPendingAmount: number;
  debitPendingAmount: number;
  chargebackOpenAmount: number;
  divergenceQuantity: number;
  divergenceAmount: number;
}

export interface ConciliationAgingModel {
  bucket: string;
  quantity: number;
  amount: number;
  type?: string | null;
}

export interface ConciliationDashboardModel {
  summary: ConciliationSummaryModel;
  salesByPeriod: ConciliationChartPointModel[];
  erpVsAcquirer: ConciliationComparisonModel;
  feesByAcquirer: ConciliationChartPointModel[];
  divergencesByType: ConciliationChartPointModel[];
  pendingAging: ConciliationAgingModel[];
}

export interface ConciliationFeeAnalysisModel {
  id: string;
  acquirerTransactionId?: string | null;
  erpTransactionId?: string | null;
  companyId?: string | null;
  establishmentId?: string | null;
  acquirerId?: string | null;
  flagId?: string | null;
  saleDate?: string | null;
  company?: string | null;
  establishment?: string | null;
  acquirer?: string | null;
  flag?: string | null;
  modality?: string | null;
  nsu?: string | number | null;
  authorization?: string | null;
  machine?: string | null;
  capture?: string | null;
  plan?: number | null;

  grossValue?: number | null;
  appliedRate?: number | null;
  appliedFeeValue?: number | null;
  acquirerLiquidValue?: number | null;

  auditGrossValue?: number | null;
  expectedRate?: number | null;
  expectedFeeValue?: number | null;
  auditLiquidValue?: number | null;

  feeDifference?: number | null;
  status: FeeAnalysisStatus;
}

export interface ErpVsAcquirerAnalysisModel {
  /**
   * Compatibilidade com o backend atual: hoje o id da linha vem como id da transação ERP.
   * Quando o backend passar a retornar ambos os lados, use erpTransactionId/acquirerTransactionId.
   */
  id: string;
  erpTransactionId?: string | null;
  acquirerTransactionId?: string | null;
  saleDateErp?: string | null;
  saleDateAcquirer?: string | null;
  company?: string | null;
  establishment?: string | null;
  acquirer?: string | null;
  flagErp?: string | null;
  flagAcquirer?: string | null;
  modalityErp?: string | null;
  modalityAcquirer?: string | null;
  nsuErp?: string | number | null;
  nsuAcquirer?: string | number | null;
  authorizationErp?: string | null;
  authorizationAcquirer?: string | null;
  erpGrossValue?: number | null;
  acquirerGrossValue?: number | null;
  differenceValue?: number | null;
  installmentErp?: number | null;
  installmentAcquirer?: number | null;
  status: ErpAcquirerComparisonStatus;
}

export interface ErpAcquirerResolutionResultModel {
  erpId?: string | null;
  acquirerId?: string | null;
  action: string;
  status: string;
  message: string;
}

export interface ErpAcquirerBatchRequestModel {
  transactionIds: string[];
}

export interface DebitAnalysisModel {
  id: string;
  debitDate?: string | null;
  settlementDate?: string | null;
  company?: string | null;
  establishment?: string | null;
  acquirer?: string | null;
  flag?: string | null;
  type?: string | null;
  reasonCode?: string | number | null;
  reasonDescription?: string | null;
  debitValue?: number | null;
  settledValue?: number | null;
  status?: ConciliationStatus | null;
  processedFile?: string | null;
}

export interface ChargebackAnalysisModel {
  id: string;
  saleDate?: string | null;
  disputeDate?: string | null;
  dueDate?: string | null;
  company?: string | null;
  establishment?: string | null;
  acquirer?: string | null;
  flag?: string | null;
  nsu?: string | number | null;
  authorization?: string | null;
  tid?: string | null;
  saleValue?: number | null;
  disputedValue?: number | null;
  reasonCode?: string | number | null;
  reasonDescription?: string | null;
  status: ChargebackStatus;
}

export interface BankSettlementAnalysisModel {
  id: string;
  expectedDate?: string | null;
  settlementDate?: string | null;
  company?: string | null;
  establishment?: string | null;
  acquirer?: string | null;
  bank?: string | null;
  flag?: string | null;
  modality?: string | null;
  creditOrderNumber?: string | number | null;
  releaseReference?: string | number | null;
  expectedValue?: number | null;
  settledValue?: number | null;
  differenceValue?: number | null;
  status?: ConciliationStatus | null;
}

export type DivergenceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;

export interface DivergenceAnalysisModel {
  id: string;
  type?: string | null;
  severity?: DivergenceSeverity | null;
  status?: ConciliationStatus | null;
  source?: string | null;
  referenceDate?: string | null;
  company?: string | null;
  establishment?: string | null;
  acquirer?: string | null;
  flag?: string | null;
  modality?: string | null;
  identifier?: string | number | null;
  expectedValue?: number | null;
  actualValue?: number | null;
  differenceValue?: number | null;
  message?: string | null;
  actionHint?: string | null;
  fileName?: string | null;
}
