export interface TransactionsAcqInstallmentModel {
  id: string;
  installmentNumber?: number;
  installment?: number;
  grossValue?: number;
  feeValue?: number;
  netValue?: number;
  adjustmentValue?: number;
  expectedPaymentDate?: string | null;
  paymentDate?: string | null;
  conciliationDate?: string | null;
  status?: string | null;
}

export interface TransactionsAcqInstallmentCreateInput {}

export interface TransactionsAcqInstallmentUpdateInput {}

export type TransactionsAcqInstallmentFiltersState = {};

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface TransactionsAcqInstallmentApiModel {
  id: string;
}

export function mapTransactionsAcqApiModel(
  input: TransactionsAcqInstallmentApiModel,
): TransactionsAcqInstallmentModel {
  return {
    ...input,
  };
}

export function mapTransactionsAcqApiModels(
  items: TransactionsAcqInstallmentApiModel[] | null | undefined,
): TransactionsAcqInstallmentModel[] {
  return (items ?? []).map(mapTransactionsAcqApiModel);
}
