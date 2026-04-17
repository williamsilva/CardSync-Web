import { CompanyMinimalModel } from './company-minimal.models';
import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';
import {
  TypeEstablishmentEnum,
  normalizeTypeEstablishmentEnum,
} from './enums/type-establishment.enum';

export interface EstablishmentMinimalModel {
  id: string;
  pvNumber: string;

  status: StatusEnum | null;
  type: TypeEstablishmentEnum | null;
  company: CompanyMinimalModel | null;
}

export function mapEstablishmentMinimalModel(
  input: EstablishmentMinimalModel,
): EstablishmentMinimalModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
    type: normalizeTypeEstablishmentEnum(input.type),
  };
}

export function mapEstablishmentMinimalModels(
  items: EstablishmentMinimalModel[] | null | undefined,
): EstablishmentMinimalModel[] {
  return (items ?? []).map(mapEstablishmentMinimalModel);
}
