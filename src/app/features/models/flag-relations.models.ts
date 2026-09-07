export type FlagRelationsModel = object;
export type FlagRelationsCreateInput = object;
export type FlagRelationsUpdateInput = object;
export type FlagRelationsApiModel = object;
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
