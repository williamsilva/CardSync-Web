import { StatusEnum } from './enums/status.enum';
import { TypeEstablishmentEnum } from './enums/type-establishment.enum';

export interface RelationAcquirerEstablishmentCreateInput {
  items: RelationAcquirerEstablishmentCreateItem[];
}

export interface RelationAcquirerEstablishmentCreateItem {
  pvNumber: number;

  companyId: string;
  status: StatusEnum | null;
  type: TypeEstablishmentEnum | null;
}

export type AcquirerRelationsModel = object;
export type AcquirerRelationsApiModel = object;
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
