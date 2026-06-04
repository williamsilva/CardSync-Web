export interface CreditOrdersMinimalModel {
  installmentNumber: number;
}

export interface CreditOrdersMinimalCreateInput {}

export interface CreditOrdersMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface CreditOrdersMinimalApiModel {
  installmentNumber: number;
}

export function mapCreditOrdersMinimalApiModel(
  input: CreditOrdersMinimalApiModel,
): CreditOrdersMinimalModel {
  return {
    ...input,
  };
}

export function mapCreditOrdersMinimalApiModels(
  items: CreditOrdersMinimalApiModel[] | null | undefined,
): CreditOrdersMinimalModel[] {
  return (items ?? []).map(mapCreditOrdersMinimalApiModel);
}
