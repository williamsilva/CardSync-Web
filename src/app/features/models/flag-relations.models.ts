export interface FlagRelationsModel {}

export interface FlagRelationsCreateInput {}

export interface FlagRelationsUpdateInput {}

export interface FlagRelationsApiModel {}

export function mapFlagApiModel(input: FlagRelationsApiModel): FlagRelationsModel {
  return {
    ...input,
  };
}

export function mapFlagApiModels(
  items: FlagRelationsApiModel[] | null | undefined,
): FlagRelationsModel[] {
  return (items ?? []).map(mapFlagApiModel);
}
