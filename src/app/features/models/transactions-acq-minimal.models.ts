import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { CaptureEnum, normalizeCaptureEnum } from './enums/capture.enum';
import { SalesSummaryMinimalModel } from './sales-summary-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ModalityEnum, normalizeModalityEnum } from './enums/modality.enum';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { TransactionsAcqInstallmentModel } from './transactions-acq-installment.models';
import {
  StatusTransactionEnum,
  normalizeStatusTransactionEnum,
} from './enums/status-transaction.enum';

export interface TransactionsAcqMinimalModel {
  id: string;
  tid?: string | null;
  cardName?: string | null;
  saleDate?: string | null;
  cardNumber?: string | null;
  authorization?: string | null;

  cvNsu: number;
  lineNumber: number;
  installment: number;

  capture: CaptureEnum | null;
  modality: ModalityEnum | null;
  statusTransaction: StatusTransactionEnum | null;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  salesSummary: SalesSummaryMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
}

export interface TransactionsAcqMinimalCreateInput {}

export interface TransactionsAcqMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface TransactionsAcqMinimalApiModel {
  id: string;

  saleDate?: string | null;
  paymentDate?: string | null;
  conciliationDate?: string | null;
  expectedPaymentDate?: string | null;

  tid?: string | null;
  machine?: string | null;
  cardNumber?: string | null;
  companyName?: string | null;

  cvNsu: number;
  feeValue: number;
  netValue: number;
  lineNumber: number;
  grossValue: number;
  installment: number;
  authorization: string;
  adjustmentValue: number;

  capture: CaptureEnum;
  modality: ModalityEnum;
  statusTransaction: StatusTransactionEnum;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  salesSummary: SalesSummaryMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  installments?: TransactionsAcqInstallmentModel[] | null;
}

export function mapTransactionsAcqMinimalApiModel(
  input: TransactionsAcqMinimalApiModel,
): TransactionsAcqMinimalModel {
  return {
    ...input,
    capture: normalizeCaptureEnum(input.capture),
    modality: normalizeModalityEnum(input.modality),
    statusTransaction: normalizeStatusTransactionEnum(input.modality),
  };
}

export function mapTransactionsAcqMinimalApiModels(
  items: TransactionsAcqMinimalApiModel[] | null | undefined,
): TransactionsAcqMinimalModel[] {
  return (items ?? []).map(mapTransactionsAcqMinimalApiModel);
}
