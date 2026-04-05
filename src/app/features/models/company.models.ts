import { UserMinimalModel } from './user-minimal.models';
import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';
import { normalizeTypeCompanyEnum, TypeCompanyEnum } from './enums/type-company.enum';

export interface CompanyModel {
  id: string;
  cnpj: string;
  fantasyName: string;
  socialReason: string;
  createdAt?: string | null;
  createdBy: UserMinimalModel | null;

  status: StatusEnum | null;
  type: TypeCompanyEnum | null;
}

export interface CompanyCreateInput {
  cnpj: string;
  fantasyName: string;
  socialReason: string;

  type: TypeCompanyEnum;
}

export interface CompanyUpdateInput {
  cnpj?: string;
  fantasyName?: string;
  socialReason?: string;

  status?: StatusEnum;
  type?: TypeCompanyEnum;
}

export type CompanyFiltersState = {
  cnpj: string;
  fantasyName: string;
  socialReason: string;
  createdAtRange: [string, string] | null;

  createdBy: string[] | null;
  statusEnum: StatusEnum[] | null;
  typeEnum: TypeCompanyEnum[] | null;
};

export interface CompanyBulkStatusInput {
  ids: string[];
}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface CompanyApiModel {
  id: string;
  cnpj: string;
  fantasyName: string;
  socialReason: string;
  createdAt?: string | null;

  status: StatusEnum;
  type: TypeCompanyEnum;

  createdBy: UserMinimalModel | null;
}

export function mapCompanyApiModel(input: CompanyApiModel): CompanyModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
    type: normalizeTypeCompanyEnum(input.type),
  };
}

export function mapCompanyApiModels(items: CompanyApiModel[] | null | undefined): CompanyModel[] {
  return (items ?? []).map(mapCompanyApiModel);
}
