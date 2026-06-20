export type ImportedFileGroup = 'ERP' | 'ADQ' | 'BANK';

export type FileGroupStatus = 'complete' | 'partial' | 'missing';

export interface ImportedFileCalendarEntityStatus {
  name: string;
  filesReceived: number;
  expected?: number;
  status: FileGroupStatus;
  entityStatus?: string | null;
  statusDate?: string | null;
  presentFiles?: string[];
  missingFiles?: string[];
}

export interface ImportedFileCalendarGroupInfo {
  status: FileGroupStatus;
  received: number;
  expected: number;
  entities: ImportedFileCalendarEntityStatus[];
}

export interface ImportedFileCalendarGroupStatus {
  erp: ImportedFileCalendarGroupInfo;
  adq: ImportedFileCalendarGroupInfo;
  bank: ImportedFileCalendarGroupInfo;
}

export interface ImportedFileCalendarItemModel {
  id: string;
  file: string;
  group: ImportedFileGroup;
  category: string;
  categoryLabel: string;
  typeFile?: string | null;
  origin?: string | null;
  status: FileProcessingStatus;
  dateFile?: string | null;
  dateImport: string;
}

export interface ImportedFileCalendarDayModel {
  date: string;
  hasFiles: boolean;
  future: boolean;
  totalFiles: number;
  erpFiles: number;
  adqFiles: number;
  bankFiles: number;
  groupStatus?: ImportedFileCalendarGroupStatus;
  files: ImportedFileCalendarItemModel[];
}

export interface ImportedFileCalendarModel {
  month: string;
  startDate: string;
  endDate: string;
  daysWithFiles: number;
  daysWithoutFiles: number;
  totalFiles: number;
  days: ImportedFileCalendarDayModel[];
}

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

export interface ProcessedFileCreateInput {}

export interface ProcessedFileUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface ProcessedFileApiModel {
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

export function mapProcessedFileApiModel(input: ProcessedFileApiModel): ProcessedFileModel {
  return {
    ...input,
  };
}

export function mapProcessedFilesApiModels(
  items: ProcessedFileApiModel[] | null | undefined,
): ProcessedFileModel[] {
  return (items ?? []).map(mapProcessedFileApiModel);
}

/* Verificar a nessecidade desses metodos */

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

export interface FileProcessingTotalsModel {
  processed: number;
  warnings: number;
  errors: number;
  invalid: number;
  duplicate: number;
  pendingContract: number;
  pendingContext: number;
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

export interface FinancialReconciliationStepResultModel {
  step: string;
  status: string;
  message?: string | null;
  analyzed?: number | null;
  reconciled?: number | null;
  partiallyReconciled?: number | null;
  pending?: number | null;
  blocked?: number | null;
  updated?: number | null;
  divergent?: number | null;
  withoutMatch?: number | null;
  generated?: number | null;
  startedAt?: string | null;
  finishedAt?: string | null;
}

export interface FinancialReconciliationPipelineResultModel {
  trigger: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  steps?: FinancialReconciliationStepResultModel[] | null;
}
