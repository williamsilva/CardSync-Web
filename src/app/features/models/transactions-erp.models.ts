import { CaptureEnum } from './enums/capture.enum';
import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ModalityEnum, normalizeModalityEnum } from './enums/modality.enum';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { TransactionsErpInstallmentModel } from './transactions-erp-installment.models';

export interface TransactionsErpModel {
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

  cvNsu: number;
  feeValue: number;
  lineNumber: number;
  grossValue: number;
  liquidValue: number;
  installment: number;
  adjustmentValue: number;

  authorization: string;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  modality: ModalityEnum | null;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  installments?: TransactionsErpInstallmentModel[] | null;
}

export interface TransactionsErpCreateInput {}

export interface TransactionsErpUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface TransactionsErpApiModel {
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
  lineNumber: number;
  grossValue: number;
  liquidValue: number;
  installment: number;
  adjustmentValue: number;

  authorization: string;

  modality: ModalityEnum;
  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  installments?: TransactionsErpInstallmentModel[] | null;
}

export function mapTransactionsErpApiModel(input: TransactionsErpApiModel): TransactionsErpModel {
  return {
    ...input,
    modality: normalizeModalityEnum(input.modality),
  };
}

export function mapTransactionsErpApiModels(
  items: TransactionsErpApiModel[] | null | undefined,
): TransactionsErpModel[] {
  return (items ?? []).map(mapTransactionsErpApiModel);
}
