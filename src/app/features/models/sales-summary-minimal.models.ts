import { BankingDomicileMinimalModel } from './bank-domicile-minimal.models';

export interface SalesSummaryMinimalModel {
  id: string;

  agency: number | null;
  pvNumber: number | null;
  currentAccount: number | null;

  bankingDomicile: BankingDomicileMinimalModel;
}

export interface SalesSummaryMinimalCreateInput {}

export interface SalesSummaryMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface SalesSummaryMinimalApiModel {
  id: string;

  agency: number | null;
  pvNumber: number | null;
  currentAccount: number | null;

  bankingDomicile: BankingDomicileMinimalModel;
}

export function mapSalesSummaryMinimalApiModel(
  input: SalesSummaryMinimalApiModel,
): SalesSummaryMinimalModel {
  return {
    ...input,
  };
}

export function mapSalesSummaryMinimalApiModels(
  items: SalesSummaryMinimalApiModel[] | null | undefined,
): SalesSummaryMinimalModel[] {
  return (items ?? []).map(mapSalesSummaryMinimalApiModel);
}
