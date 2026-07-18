import { CaptureEnum } from './enums/capture.enum';
import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { SalesSummaryMinimalModel } from './sales-summary-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ModalityEnum, normalizeModalityEnum } from './enums/modality.enum';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { TransactionsAcqInstallmentModel } from './transactions-acq-installment.models';

export interface TransactionsAcqModel {
  id: string;

  saleDate?: string | null;
  paymentDate?: string | null;
  conciliationDate?: string | null;
  expectedPaymentDate?: string | null;

  tid?: string | null;
  machine?: string | null;
  rvNumber: string | null;
  cardNumber?: string | null;
  companyName?: string | null;
  authorization: string | null;
  establishmentPvNumber?: string | null;

  cvNsu: number;
  feeValue: number;
  netValue: number;
  grossValue: number;
  lineNumber: number;
  installment: number;
  adjustmentValue: number;

  capture?: CaptureEnum | null;
  modality: ModalityEnum | null;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  salesSummary?: SalesSummaryMinimalModel | null;
  installments?: TransactionsAcqInstallmentModel[] | null;
}

export interface TransactionsAcqCreateInput {}

export interface TransactionsAcqUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface TransactionsAcqApiModel {
  id: string;

  saleDate?: string | null;
  expectedPaymentDate?: string | null;
  paymentDate?: string | null;
  conciliationDate?: string | null;

  tid?: string | null;
  cardNumber?: string | null;
  machine?: string | null;
  capture?: CaptureEnum | null;
  companyName?: string | null;
  establishmentPvNumber?: string | null;

  cvNsu: number;
  feeValue: number;
  netValue: number;
  grossValue: number;
  lineNumber: number;
  installment: number;
  adjustmentValue: number;

  rvNumber: string;
  authorization: string;

  modality: ModalityEnum;
  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  salesSummary?: SalesSummaryMinimalModel | null;
  installments?: TransactionsAcqInstallmentModel[] | null;
}

export function mapTransactionsAcqApiModel(input: TransactionsAcqApiModel): TransactionsAcqModel {
  return {
    ...input,
    modality: normalizeModalityEnum(input.modality),
  };
}

export function mapTransactionsAcqApiModels(
  items: TransactionsAcqApiModel[] | null | undefined,
): TransactionsAcqModel[] {
  return (items ?? []).map(mapTransactionsAcqApiModel);
}
