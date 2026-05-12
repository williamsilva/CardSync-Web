export interface TransactionsErpInstallmentModel {
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

export interface TransactionsErpInstallmentCreateInput {}

export interface TransactionsErpInstallmentUpdateInput {}

export type TransactionsErpInstallmentFiltersState = {};

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface TransactionsErpInstallmentApiModel {
  id: string;
}

export function mapTransactionsErpApiModel(
  input: TransactionsErpInstallmentApiModel,
): TransactionsErpInstallmentModel {
  return {
    ...input,
  };
}

export function mapTransactionsErpApiModels(
  items: TransactionsErpInstallmentApiModel[] | null | undefined,
): TransactionsErpInstallmentModel[] {
  return (items ?? []).map(mapTransactionsErpApiModel);
}
