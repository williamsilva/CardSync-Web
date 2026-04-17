export interface AcquirerRelationsModel {}

export interface AcquirerRelationsCreateInput {}

export interface AcquirerRelationsUpdateInput {}

export interface AcquirerRelationsApiModel {}

export function mapAcquirerApiModel(input: AcquirerRelationsApiModel): AcquirerRelationsModel {
  return {
    ...input,
  };
}

export function mapAcquirerApiModels(
  items: AcquirerRelationsApiModel[] | null | undefined,
): AcquirerRelationsModel[] {
  return (items ?? []).map(mapAcquirerApiModel);
}
