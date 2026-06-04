export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}

export type FileProcessingStatus =
  | 'RECEIVED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'PROCESSED_WITH_WARNINGS'
  | 'ERROR'
  | 'DUPLICATE'
  | 'INVALID';

export type ErpCommercialStatus =
  | 'OK'
  | 'PENDING_COMPANY'
  | 'PENDING_ESTABLISHMENT'
  | 'PENDING_CONTRACT'
  | 'PENDING_BUSINESS_CONTEXT';

export interface ProcessedFileModel {
  id: string;
  file: string;
  originFile?: string | null;
  group?: string | null;
  status: FileProcessingStatus;
  dateFile?: string | null;
  dateImport?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  totalLines?: number | null;
  processedLines?: number | null;
  ignoredLines?: number | null;
  warningLines?: number | null;
  errorLines?: number | null;
  pendingContractLines?: number | null;
  pendingBusinessContextLines?: number | null;
  statusMessage?: string | null;
  errorMessage?: string | null;
}

export interface ProcessedFileSummaryModel {
  id: string;
  file: string;
  status: FileProcessingStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  totalLines?: number | null;
  processedLines?: number | null;
  ignoredLines?: number | null;
  warningLines?: number | null;
  errorLines?: number | null;
  pendingContractLines?: number | null;
  pendingBusinessContextLines?: number | null;
  statusMessage?: string | null;
  errorMessage?: string | null;
}

export interface ProcessedFileErrorModel {
  id: string;
  lineNumber?: number | null;
  errorType?: string | null;
  errorCode?: string | null;
  message?: string | null;
  rawLine?: string | null;
  createdAt?: string | null;
}

export interface FileProcessingScheduleStatusModel {
  system: 'ERP' | 'REDE' | 'BANK' | string;
  running: boolean;
  lastStartedAt?: string | null;
  lastFinishedAt?: string | null;
  lastSuccess?: boolean | null;
  lastTrigger?: string | null;
  lastMessage?: string | null;
}

export interface ScheduleStatusResponse {
  erp: FileProcessingScheduleStatusModel;
  rede: FileProcessingScheduleStatusModel;
  bank?: FileProcessingScheduleStatusModel;
}

export interface ReprocessPendingErpResultModel {
  scanned: number;
  reprocessed: number;
  resolved: number;
  stillPendingContract: number;
  stillPendingBusinessContext: number;
  errors: number;
}

export interface ErpPendingSaleModel {
  id: string;
  lineNumber?: number | null;
  file?: string | null;
  saleDate?: string | null;
  nsu?: number | null;
  authorization?: string | null;
  acquirer?: string | null;
  flag?: string | null;
  company?: string | null;
  establishment?: string | null;
  sourceCompanyCnpj?: string | null;
  sourceCompanyName?: string | null;
  sourceEstablishmentPvNumber?: number | null;
  sourceEstablishmentName?: string | null;
  installment?: number | null;
  grossValue?: number | null;
  liquidValue?: number | null;
  discountValue?: number | null;
  contractedFee?: number | null;
  commercialStatus: ErpCommercialStatus;
  commercialStatusMessage?: string | null;
}

export interface RedeCreditOrderModel {
  id: string;
  processedFile?: string | null;
  lineNumber?: number | null;
  creditOrderNumber?: number | null;
  rvNumber?: number | null;
  originalPvNumber?: number | null;
  installmentNumber?: number | null;
  installmentTotal?: number | null;
  rvDate?: string | null;
  releaseDate?: string | null;
  creditOrderDate?: string | null;
  releaseValue?: number | null;
  grossRvValue?: number | null;
  discountRateValue?: number | null;
  acquirer?: string | null;
  flag?: string | null;
  company?: string | null;
}

export interface RedeAdjustmentModel {
  id: string;
  processedFile?: string | null;
  lineNumber?: number | null;
  recordType?: string | null;
  sourceRecordIdentifier?: string | null;
  ecommerce?: boolean | null;
  pvNumber?: number | null;
  nsu?: number | null;
  authorization?: string | null;
  tid?: string | null;
  adjustmentReason?: number | null;
  adjustmentDescription?: string | null;
  adjustmentDate?: string | null;
  creditDate?: string | null;
  releaseDate?: string | null;
  adjustmentValue?: number | null;
  grossValue?: number | null;
  liquidValue?: number | null;
  discountValue?: number | null;
  acquirer?: string | null;
  company?: string | null;
  establishment?: string | null;
}

export interface RedeSettledDebtModel {
  id: string;
  processedFile?: string | null;
  lineNumber?: number | null;
  recordType?: string | null;
  pvNumber?: number | null;
  nsu?: number | null;
  authorization?: string | null;
  tid?: string | null;
  numberDebitOrder?: number | null;
  dateDebitOrder?: string | null;
  liquidatedDate?: string | null;
  valueDebitOrder?: number | null;
  liquidatedValue?: number | null;
  reasonCode?: number | null;
  reasonDescription?: string | null;
  acquirer?: string | null;
  flag?: string | null;
}

export interface RedePendingDebtModel {
  id: string;
  processedFile?: string | null;
  lineNumber?: number | null;
  recordType?: string | null;
  pvNumber?: number | null;
  nsu?: number | null;
  authorization?: string | null;
  tid?: string | null;
  numberDebitOrder?: number | null;
  dateDebitOrder?: string | null;
  valueDebitOrder?: number | null;
  compensatedValue?: number | null;
  reasonCode?: number | null;
  reasonDescription?: string | null;
  acquirer?: string | null;
  flag?: string | null;
  company?: string | null;
  establishment?: string | null;
}

export interface RedeTotalizerModel {
  id: string;
  type: 'CREDIT_TOTALIZER' | 'MATRIX_TOTALIZER' | string;
  processedFile?: string | null;
  lineNumber?: number | null;
  pvNumber?: number | null;
  creditDate?: string | null;
  totalCreditValue?: number | null;
  totalValueAdvanceCredits?: number | null;
  totalNumberMatrixSummaries?: number | null;
  totalValueNormalCredits?: number | null;
  totalValueAnticipated?: number | null;
  amountCreditAdjustments?: number | null;
  totalValueCreditAdjustments?: number | null;
  amountDebitAdjustments?: number | null;
  totalValueDebitAdjustments?: number | null;
  acquirer?: string | null;
  company?: string | null;
  establishment?: string | null;
}

export interface FileProcessingMetricModel {
  key: string;
  label: string;
  quantity: number;
  amount?: number | null;
}

export interface FileProcessingStatusCountModel {
  group?: string | null;
  status?: string | null;
  quantity: number;
}

export interface ReconciliationStatusAmountModel {
  source: string;
  status?: number | null;
  quantity: number;
  amount?: number | null;
}

export interface FileProcessingDivergenceContextModel {
  source: string;
  company?: string | null;
  acquirer?: string | null;
  bank?: string | null;
  flag?: string | null;
  quantity: number;
  amount?: number | null;
}

export interface FileProcessingTopErrorFileModel {
  processedFileId: string;
  fileName?: string | null;
  origin?: string | null;
  group?: string | null;
  status?: string | null;
  errors: number;
  warnings: number;
}

export interface FileProcessingDashboardModel {
  cards: FileProcessingMetricModel[];
  filesByStatus: FileProcessingStatusCountModel[];
  reconciliationByStatus: ReconciliationStatusAmountModel[];
  divergenceContexts: FileProcessingDivergenceContextModel[];
  topFilesWithErrors: FileProcessingTopErrorFileModel[];
}

export interface BankReleaseModel {
  id: string;
  processedFile?: string | null;
  lineNumber?: number | null;
  bank?: string | null;
  company?: string | null;
  acquirer?: string | null;
  flag?: string | null;
  establishment?: string | null;
  bankingDomicile?: string | null;
  releaseDate?: string | null;
  accountingDate?: string | null;
  releaseValue?: number | null;
  releaseType?: string | null;
  releaseCategory?: number | null;
  releaseCategoryCode?: number | null;
  historicalCodeBank?: number | null;
  descriptionHistoricalBank?: string | null;
  documentComplementNumber?: string | null;
  reconciliationStatus?: number | null;
  numberReconciliations?: number | null;
  numberCreditOrders?: number | null;
  numberParcels?: number | null;
}

export interface BankReconciliationResultModel {
  releasesAnalyzed: number;
  releasesReconciled: number;
  releasesMatchedByCreditOrders: number;
  releasesMatchedByInstallments: number;
  creditOrdersReconciled: number;
  installmentsReconciled: number;
  transactionsUpdated: number;
  releasesWithoutMatch: number;
  releasesSkippedMissingContext: number;
  candidateGroupsSkippedBySafetyCap: number;
  totalReleaseValueReconciled?: number | null;
  totalCreditOrderValueReconciled?: number | null;
  totalInstallmentValueReconciled?: number | null;
}
