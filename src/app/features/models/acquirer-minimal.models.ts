import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';

export interface AcquirerMinimalModel {
  id: string;
  cnpj: string;
  fantasyName: string;
  socialReason: string;

  status: StatusEnum | null;
}

export function mapAcquirerMinimalModel(input: AcquirerMinimalModel): AcquirerMinimalModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapAcquirerMinimalModels(
  items: AcquirerMinimalModel[] | null | undefined,
): AcquirerMinimalModel[] {
  return (items ?? []).map(mapAcquirerMinimalModel);
}
