import { ModalityEnum } from './enums/modality.enum';
import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { StatusTransactionEnum } from './enums/status-transaction.enum';
import { StatusPaymentBankEnum } from './enums/status-payment-bank.enum';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { TransactionsErpMinimalModel } from './transactions-erp-minimal.models';

export interface TransactionsErpInstallmentModel {
  id: string;

  saleDate?: string | null;
  paymentDate?: string | null;

  lineNumber?: number | null;
  installment?: number | null;
  transactionId?: string | null;
  authorization?: string | null;
  cvNsu?: number | string | null;
  conciliationDate?: string | null;
  installmentTotal?: number | null;
  installmentNumber?: number | null;
  expectedPaymentDate?: string | null;

  feeValue?: number | null;
  netValue?: number | null;
  grossValue?: number | null;
  liquidValue?: number | null;
  adjustmentValue?: number | null;

  modality: ModalityEnum | null;
  statusTransaction: StatusTransactionEnum | null;
  statusPaymentBank?: StatusPaymentBankEnum | null;

  flag?: FlagMinimalModel | null;
  company?: CompanyMinimalModel | null;
  acquirer?: AcquirerMinimalModel | null;
  transaction?: TransactionsErpMinimalModel | null;
  processedFile?: ProcessedFileMinimalModel | null;
  establishment?: EstablishmentMinimalModel | null;
}

export interface TransactionsErpInstallmentCreateInput {}

export interface TransactionsErpInstallmentUpdateInput {}

export interface TransactionsErpInstallmentApiModel extends TransactionsErpInstallmentModel {}

export function mapTransactionsErpInstallmentApiModel(
  input: TransactionsErpInstallmentApiModel,
): TransactionsErpInstallmentModel {
  return {
    ...input,
  };
}

export function mapTransactionsErpInstallmentApiModels(
  items: TransactionsErpInstallmentApiModel[] | null | undefined,
): TransactionsErpInstallmentModel[] {
  return (items ?? []).map(mapTransactionsErpInstallmentApiModel);
}
