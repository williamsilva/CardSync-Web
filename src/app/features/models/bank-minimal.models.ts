export interface BankMinimalModel {
  id: string;

  code: string | null;
  name: string | null;
}

export interface BankMinimalCreateInput {}

export interface BankMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface BankMinimalApiModel {
  id: string;

  code: string | null;
  name: string | null;
}

export function mapBankMinimalApiModel(input: BankMinimalApiModel): BankMinimalModel {
  return {
    ...input,
  };
}

export function mapBankMinimalApiModels(
  items: BankMinimalApiModel[] | null | undefined,
): BankMinimalModel[] {
  return (items ?? []).map(mapBankMinimalApiModel);
}
