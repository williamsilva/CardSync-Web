import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';

export interface BankMinimalModel {
  id: string;

  code: string | null;
  name: string | null;
  status: StatusEnum | null;
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
  status: StatusEnum | null;
}

export function mapBankMinimalApiModel(input: BankMinimalApiModel): BankMinimalModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapBankMinimalApiModels(
  items: BankMinimalApiModel[] | null | undefined,
): BankMinimalModel[] {
  return (items ?? []).map(mapBankMinimalApiModel);
}
