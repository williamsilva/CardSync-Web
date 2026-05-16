import { BankMinimalModel } from './bank-minimal.models';

export interface BankingDomicileMinimalModel {
  id: string;

  agency: number | null;
  currentAccount: number | null;

  bank: BankMinimalModel;
}

export interface BankingDomicileMinimalCreateInput {}

export interface BankingDomicileMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface BankingDomicileMinimalApiModel {
  id: string;

  agency: number | null;
  currentAccount: number | null;

  bank: BankMinimalModel;
}

export function mapBankingDomicileMinimalApiModel(
  input: BankingDomicileMinimalApiModel,
): BankingDomicileMinimalModel {
  return {
    ...input,
  };
}

export function mapBankingDomicileMinimalApiModels(
  items: BankingDomicileMinimalApiModel[] | null | undefined,
): BankingDomicileMinimalModel[] {
  return (items ?? []).map(mapBankingDomicileMinimalApiModel);
}
