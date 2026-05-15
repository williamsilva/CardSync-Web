import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';

export interface TransactionsAcqInstallmentModel {
  id: string;

  transactionId?: string | null;
  saleDate?: string | null;
  expectedPaymentDate?: string | null;
  paymentDate?: string | null;
  conciliationDate?: string | null;

  cvNsu?: number | string | null;
  authorization?: string | null;
  installmentNumber?: number | null;
  installment?: number | null;
  installmentTotal?: number | null;

  grossValue?: number | null;
  feeValue?: number | null;
  netValue?: number | null;
  liquidValue?: number | null;
  adjustmentValue?: number | null;

  status?: string | null;
  paymentStatus?: string | null;
  statusPaymentBank?: string | null;
  transactionStatus?: string | null;

  lineNumber?: number | null;
  flag?: FlagMinimalModel | null;
  company?: CompanyMinimalModel | null;
  acquirer?: AcquirerMinimalModel | null;
  processedFile?: ProcessedFileMinimalModel | null;
  establishment?: EstablishmentMinimalModel | null;
}

export interface TransactionsAcqInstallmentCreateInput {}

export interface TransactionsAcqInstallmentUpdateInput {}

export interface TransactionsAcqInstallmentApiModel extends TransactionsAcqInstallmentModel {}

export function mapTransactionsAcqInstallmentApiModel(
  input: TransactionsAcqInstallmentApiModel,
): TransactionsAcqInstallmentModel {
  return {
    ...input,
    netValue: input.netValue ?? input.liquidValue ?? null,
  };
}

export function mapTransactionsAcqInstallmentApiModels(
  items: TransactionsAcqInstallmentApiModel[] | null | undefined,
): TransactionsAcqInstallmentModel[] {
  return (items ?? []).map(mapTransactionsAcqInstallmentApiModel);
}
