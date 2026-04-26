import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';

export interface FlagMinimalModel {
  id: string;
  name: string;
  erpCode: number;
  status: StatusEnum | null;
}

export function mapFlagMinimalModel(input: FlagMinimalModel): FlagMinimalModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapFlagMinimalModels(
  items: FlagMinimalModel[] | null | undefined,
): FlagMinimalModel[] {
  return (items ?? []).map(mapFlagMinimalModel);
}
