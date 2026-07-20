export interface CreditOrdersReleasesBankMinimalModel {
  id: string;
  releaseDate: string | null;
}

export interface CreditOrdersMinimalModel {
  id: string;
  creditOrderNumber: number;
  installmentTotal: number;
  installmentNumber: number;

  statusPaymentBank: string | null;
  salesSummaryStatus: string | null;

  releaseDate: string | null;
  creditOrderDate: string | null;

  grossRvValue: number | null;
  releaseValue: number | null;

  releasesBank: CreditOrdersReleasesBankMinimalModel | null;
}

export interface CreditOrdersMinimalCreateInput {}

export interface CreditOrdersMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface CreditOrdersMinimalApiModel {
  id: string;
  creditOrderNumber: number;
  installmentTotal: number;
  installmentNumber: number;

  statusPaymentBank: string | null;
  salesSummaryStatus: string | null;

  releaseDate: string | null;
  creditOrderDate: string | null;

  grossRvValue: number | null;
  releaseValue: number | null;

  releasesBank: CreditOrdersReleasesBankMinimalModel | null;
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
