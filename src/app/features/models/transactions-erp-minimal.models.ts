import { CaptureEnum } from './enums/capture.enum';
import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ModalityEnum, normalizeModalityEnum } from './enums/modality.enum';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { TransactionsErpInstallmentModel } from './transactions-erp-installment.models';
import {
  TransactionStatusEnum,
  normalizeTransactionStatusEnum,
} from './enums/transaction-status.enum';

export interface TransactionsErpMinimalModel {
  id: string;
  tid?: string | null;
  cardName?: string | null;
  cardNumber?: string | null;
  authorization?: string | null;

  saleDate?: string | null;

  cvNsu: number;
  lineNumber: number;
  installment: number;

  capture: CaptureEnum | null;
  modality: ModalityEnum | null;
  transactionStatus: TransactionStatusEnum | null;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  //bankingDomicile: BankingDomicileMinimalModel;
}

export interface TransactionsErpMinimalCreateInput {}

export interface TransactionsErpMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface TransactionsErpMinimalApiModel {
  id: string;

  saleDate?: string | null;
  paymentDate?: string | null;
  conciliationDate?: string | null;
  expectedPaymentDate?: string | null;

  tid?: string | null;
  machine?: string | null;
  cardNumber?: string | null;
  companyName?: string | null;
  capture: CaptureEnum | null;

  cvNsu: number;
  feeValue: number;
  netValue: number;
  lineNumber: number;
  grossValue: number;
  installment: number;
  authorization: string;
  adjustmentValue: number;

  modality: ModalityEnum;
  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  transactionStatus: TransactionStatusEnum;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  installments?: TransactionsErpInstallmentModel[] | null;
}

export function mapTransactionsErpMinimalApiModel(
  input: TransactionsErpMinimalApiModel,
): TransactionsErpMinimalModel {
  return {
    ...input,
    modality: normalizeModalityEnum(input.modality),
    transactionStatus: normalizeTransactionStatusEnum(input.modality),
  };
}

export function mapTransactionsErpMinimalApiModels(
  items: TransactionsErpMinimalApiModel[] | null | undefined,
): TransactionsErpMinimalModel[] {
  return (items ?? []).map(mapTransactionsErpMinimalApiModel);
}
