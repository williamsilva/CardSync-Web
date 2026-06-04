export interface AdjustmentsMinimalModel {
  installmentNumber: number;
}

export interface AdjustmentsMinimalCreateInput {}

export interface AdjustmentsMinimalUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface AdjustmentsMinimalApiModel {
  installmentNumber: number;
}

export function mapAdjustmentsMinimalApiModel(
  input: AdjustmentsMinimalApiModel,
): AdjustmentsMinimalModel {
  return {
    ...input,
  };
}

export function mapAdjustmentsMinimalApiModels(
  items: AdjustmentsMinimalApiModel[] | null | undefined,
): AdjustmentsMinimalModel[] {
  return (items ?? []).map(mapAdjustmentsMinimalApiModel);
}
