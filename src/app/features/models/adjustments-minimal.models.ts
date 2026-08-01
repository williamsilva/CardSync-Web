export interface AdjustmentsMinimalModel {
  installmentNumber: number;
  adjustmentReason?: number | null;
  /**
   * Motivo em texto livre — só vem preenchido em ajustes criados manualmente (tela de Ajuste),
   * que não têm adjustmentReason (código do arquivo automático da adquirente). Ver
   * AdjustmentTableComponent#adjustmentMotivoLabel.
   */
  adjustmentDescription?: string | null;
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
