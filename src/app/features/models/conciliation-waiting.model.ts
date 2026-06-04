import {
  StatusTransactionReasonEnum,
  StatusTransactionReasonInput,
  normalizeStatusTransactionReasonEnum,
} from './enums/status-transaction-reason.enum';
import { ModalityEnum, ModalityInput, normalizeModalityEnum } from './enums/modality.enum';
import { CaptureEnum, CaptureInput, normalizeCaptureEnum } from './enums/capture.enum';

export type ErpAcquirerTruthSource = 'ERP' | 'ACQUIRER';

export interface ErpAcquirerComparisonModel {
  erpId: string;
  acquirerId: string;
  hasDivergence: boolean;
  fields: ErpAcquirerFieldDiffModel[];
}

export interface ErpAcquirerFieldDiffModel {
  field: string;
  erpValue?: string | null;
  acquirerValue?: string | null;
  different: boolean;
}

export interface ReconcileBankResultModel {}

export interface ReconcileFeesResultModel {
  okRates: number;
  analyzed: number;
  divergentRates: number;
  updatedErpSales: number;
  missingValidContracts: number;
  skippedWithoutAcquire: number;
}

export interface ReconcileErpAcquirerResultModel {
  analyzed: number;
  matched: number;
  updated: number;
  skippedDivergent: number;
  flagUpdated: number;
  businessContextUpdated: number;
  notMatched: number;
  valueDivergences: number;
  acquirerDivergences: number;
  ambiguousMatches: number;
}

export interface ErpAcquirerResolutionResultModel {
  erpId?: string | null;
  acquirerId?: string | null;
  action: string;
  status: string;
  message: string;
}

export interface ErpAcquirerBatchResolutionResultModel {
  action: string;
  requested: number;
  success: number;
  failed: number;
  items: ErpAcquirerBatchResolutionItemModel[];
}

export interface ErpAcquirerBatchResolutionItemModel {
  sourceId: string;
  erpId?: string | null;
  acquirerId?: string | null;
  status: string;
  message: string;
}

export interface ConciliationWaitingCompanyModel {
  id?: string | null;
  cnpj?: string | null;
  fantasyName?: string | null;
  socialReason?: string | null;
  status?: string | null;
}

export interface ConciliationWaitingAcquirerModel {
  id?: string | null;
  cnpj?: string | null;
  fantasyName?: string | null;
  socialReason?: string | null;
  status?: string | null;
}

export interface ConciliationWaitingEstablishmentModel {
  id?: string | null;
  pvNumber?: string | number | null;
  fantasyName?: string | null;
  commercialName?: string | null;
  status?: string | null;
  company?: ConciliationWaitingCompanyModel | null;
}

export interface ConciliationWaitingFlagModel {
  id?: string | null;
  name?: string | null;
  erpCode?: string | null;
  status?: string | null;
}

export interface ConciliationWaitingSideModel {
  id: string;
  cvNsu?: string | number | null;
  authorization?: string | null;
  saleDate?: string | Date | null;
  grossValue?: number | null;
  liquidValue?: number | null;
  discountValue?: number | null;
  installment?: number | null;
  modality?: ModalityEnum | null;
  capture?: CaptureEnum | null;
  statusTransaction?: string | number | null;
  statusTransactionReason?: StatusTransactionReasonEnum | null;
  saleReconciliationDate?: string | Date | null;
  company?: ConciliationWaitingCompanyModel | null;
  acquirer?: ConciliationWaitingAcquirerModel | null;
  establishment?: ConciliationWaitingEstablishmentModel | null;
  flag?: ConciliationWaitingFlagModel | null;
}

export interface ConciliationWaitingModel {
  id: string;

  erpTransactionId?: string | null;
  acquirerTransactionId?: string | null;

  cvNsu?: string | number | null;
  authorization?: string | null;
  saleDate?: string | Date | null;

  grossValue: number;
  liquidValue: number;
  discountValue?: number | null;
  installment?: number | null;

  modality?: ModalityEnum | null;
  capture?: CaptureEnum | null;
  status?: StatusTransactionReasonEnum | null;
  statusTransactionReason?: StatusTransactionReasonEnum | null;
  statusTransaction?: string | number | null;

  company?: ConciliationWaitingCompanyModel | null;
  acquirer?: ConciliationWaitingAcquirerModel | null;
  establishment?: ConciliationWaitingEstablishmentModel | null;
  flag?: ConciliationWaitingFlagModel | null;

  erp?: ConciliationWaitingSideModel | null;
  acquirerTransaction?: ConciliationWaitingSideModel | null;
}

export interface ConciliationWaitingCreateInput {}

export interface ConciliationWaitingUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita o contrato antigo, o contrato flat e o novo contrato com erp/acquirerTransaction.
 */
export interface ConciliationWaitingApiModel extends Omit<
  Partial<ConciliationWaitingModel>,
  'status' | 'statusTransactionReason' | 'modality' | 'capture' | 'erp' | 'acquirerTransaction'
> {
  id: string;
  status?: StatusTransactionReasonInput;
  statusTransactionReason?: StatusTransactionReasonInput;
  modality?: ModalityInput;
  capture?: CaptureInput;
  erp?: Partial<ConciliationWaitingSideModel> | null;
  acquirerTransaction?: Partial<ConciliationWaitingSideModel> | null;
}

function normalizeSide(
  side: Partial<ConciliationWaitingSideModel> | null | undefined,
): ConciliationWaitingSideModel | null {
  if (!side?.id) return null;

  return {
    ...(side as ConciliationWaitingSideModel),
    id: String(side.id),
    modality: normalizeModalityEnum(side.modality as ModalityInput),
    capture: normalizeCaptureEnum(side.capture as CaptureInput),
    statusTransactionReason: normalizeStatusTransactionReasonEnum(
      side.statusTransactionReason as StatusTransactionReasonInput,
    ),
  };
}

function firstDefined<T>(...values: (T | null | undefined)[]): T | null {
  for (const value of values) {
    if (value !== null && value !== undefined) return value;
  }

  return null;
}

function numberOrZero(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapConciliationWaitingApiModel(
  input: ConciliationWaitingApiModel,
): ConciliationWaitingModel {
  const erp = normalizeSide(input.erp);
  const acquirerTransaction = normalizeSide(input.acquirerTransaction);

  const statusTransactionReason = normalizeStatusTransactionReasonEnum(
    firstDefined(input.statusTransactionReason, input.status, erp?.statusTransactionReason),
  );

  return {
    ...(input as ConciliationWaitingModel),
    id: String(input.id),
    erp,
    acquirerTransaction,
    erpTransactionId: firstDefined(input.erpTransactionId, erp?.id, input.id),
    acquirerTransactionId: firstDefined(input.acquirerTransactionId, acquirerTransaction?.id),

    cvNsu: firstDefined(input.cvNsu, erp?.cvNsu, acquirerTransaction?.cvNsu),
    authorization: firstDefined(
      input.authorization,
      erp?.authorization,
      acquirerTransaction?.authorization,
    ),
    saleDate: firstDefined(input.saleDate, erp?.saleDate, acquirerTransaction?.saleDate),

    grossValue: numberOrZero(
      firstDefined(input.grossValue, erp?.grossValue, acquirerTransaction?.grossValue),
    ),
    liquidValue: numberOrZero(
      firstDefined(input.liquidValue, erp?.liquidValue, acquirerTransaction?.liquidValue),
    ),
    discountValue: numberOrZero(
      firstDefined(input.discountValue, erp?.discountValue, acquirerTransaction?.discountValue),
    ),
    installment: firstDefined(
      input.installment,
      erp?.installment,
      acquirerTransaction?.installment,
    ),

    modality: normalizeModalityEnum(
      firstDefined(input.modality, erp?.modality, acquirerTransaction?.modality),
    ),
    capture: normalizeCaptureEnum(
      firstDefined(input.capture, erp?.capture, acquirerTransaction?.capture),
    ),
    status: statusTransactionReason,
    statusTransactionReason,
    statusTransaction: firstDefined(
      input.statusTransaction,
      erp?.statusTransaction,
      acquirerTransaction?.statusTransaction,
    ),

    company: firstDefined(input.company, erp?.company, acquirerTransaction?.company),
    acquirer: firstDefined(input.acquirer, erp?.acquirer, acquirerTransaction?.acquirer),
    establishment: firstDefined(
      input.establishment,
      erp?.establishment,
      acquirerTransaction?.establishment,
    ),
    flag: firstDefined(input.flag, erp?.flag, acquirerTransaction?.flag),
  };
}

export function mapConciliationWaitingApiModels(
  items: ConciliationWaitingApiModel[] | null | undefined,
): ConciliationWaitingModel[] {
  return (items ?? []).map(mapConciliationWaitingApiModel);
}
