import { UserMinimalModel } from './user-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';
import {
  TypeEstablishmentEnum,
  normalizeTypeEstablishmentEnum,
} from './enums/type-establishment.enum';

export interface EstablishmentModel {
  id: string;
  pvNumber: string | null;
  createdAt?: string | null;

  status: StatusEnum | null;
  type: TypeEstablishmentEnum | null;

  createdBy: UserMinimalModel | null;
  company?: CompanyMinimalModel | null;
  acquirer?: AcquirerMinimalModel | null;
}

export interface EstablishmentCreateInput {
  pvNumber: string;
  companyId?: string;
  acquirerId?: string;
  status?: StatusEnum;
  type?: TypeEstablishmentEnum;
}

export interface EstablishmentUpdateInput {
  pvNumber?: string;
  companyId?: string;
  acquirerId?: string;
  status?: StatusEnum;
  type?: TypeEstablishmentEnum;
}

export type EstablishmentFiltersState = {
  pvNumber: string | null;
  createdAtRange: [string, string] | null;

  company: string[] | null;
  acquirer: string[] | null;
  createdBy: string[] | null;
  statusEnum: StatusEnum[] | null;
  typeEnum: TypeEstablishmentEnum[] | null;
};

export interface EstablishmentBulkStatusInput {
  ids: string[];
}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface EstablishmentApiModel {
  id: string;
  pvNumber: string | null;
  createdAt?: string | null;

  status: StatusEnum;
  type: TypeEstablishmentEnum | null;
  createdBy: UserMinimalModel | null;
  company?: CompanyMinimalModel | null;
  acquirer?: AcquirerMinimalModel | null;
}

export function mapEstablishmentApiModel(input: EstablishmentApiModel): EstablishmentModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
    type: normalizeTypeEstablishmentEnum(input.type),
  };
}

export function mapEstablishmentApiModels(
  items: EstablishmentApiModel[] | null | undefined,
): EstablishmentModel[] {
  return (items ?? []).map(mapEstablishmentApiModel);
}
