import { UserMinimalModel } from './user-minimal.models';
import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';

export interface AcquirerModel {
  id: string;
  cnpj: string;
  fantasyName: string;
  socialReason: string;
  createdAt?: string | null;

  status: StatusEnum | null;

  //flags: Company[];
  //companies: Company[];
  //establishments: Establishment[];
  createdBy: UserMinimalModel | null;
}

export interface AcquirerCreateInput {
  cnpj: string;
  fantasyName: string;
  socialReason: string;
}

export interface AcquirerUpdateInput {
  cnpj?: string;
  fantasyName?: string;
  socialReason?: string;

  status?: StatusEnum;
}

export type AcquirerFiltersState = {
  cnpj: string;
  fantasyName: string;
  socialReason: string;
  createdAtRange: [string, string] | null;

  createdBy: string[] | null;
  statusEnum: StatusEnum[] | null;
};

export interface AcquirerBulkStatusInput {
  ids: string[];
}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface AcquirerApiModel {
  id: string;
  cnpj: string;
  fantasyName: string;
  socialReason: string;
  createdAt?: string | null;

  status: StatusEnum;

  createdBy: UserMinimalModel | null;
}

export function mapAcquirerApiModel(input: AcquirerApiModel): AcquirerModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapAcquirerApiModels(
  items: AcquirerApiModel[] | null | undefined,
): AcquirerModel[] {
  return (items ?? []).map(mapAcquirerApiModel);
}
