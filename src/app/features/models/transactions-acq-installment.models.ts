import { ModalityEnum } from './enums/modality.enum';
import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { TransactionStatusEnum } from './enums/transaction-status.enum';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { TransactionsAcqMinimalModel } from './transactions-acq-minimal.models';
import { PaymentStatusEnum } from './enums/payment-status.enum';

export interface TransactionsAcqInstallmentModel {
  id: string;

  saleDate?: string | null;
  paymentDate?: string | null;
  transactionId?: string | null;
  authorization?: string | null;
  cvNsu?: number | string | null;
  conciliationDate?: string | null;
  expectedPaymentDate?: string | null;

  feeValue?: number | null;
  netValue?: number | null;
  lineNumber?: number | null;
  grossValue?: number | null;
  installment?: number | null;
  liquidValue?: number | null;
  adjustmentValue?: number | null;
  installmentTotal?: number | null;
  installmentNumber?: number | null;

  paymentStatus?: PaymentStatusEnum | null;
  transactionStatus: TransactionStatusEnum | null;
  transaction?: TransactionsAcqMinimalModel | null;
  processedFile?: ProcessedFileMinimalModel | null;
  establishment?: EstablishmentMinimalModel | null;

  modality: ModalityEnum | null;
  flag?: FlagMinimalModel | null;
  company?: CompanyMinimalModel | null;
  acquirer?: AcquirerMinimalModel | null;
}

export interface TransactionsAcqInstallmentCreateInput {}

export interface TransactionsAcqInstallmentUpdateInput {}

export interface TransactionsAcqInstallmentApiModel extends TransactionsAcqInstallmentModel {}

export function mapTransactionsAcqInstallmentApiModel(
  input: TransactionsAcqInstallmentApiModel,
): TransactionsAcqInstallmentModel {
  return {
    ...input,
  };
}

export function mapTransactionsAcqInstallmentApiModels(
  items: TransactionsAcqInstallmentApiModel[] | null | undefined,
): TransactionsAcqInstallmentModel[] {
  return (items ?? []).map(mapTransactionsAcqInstallmentApiModel);
}
