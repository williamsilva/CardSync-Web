import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';

export interface FlagCompanyRelationModel extends Omit<CompanyMinimalModel, 'id'> {
  companyId: string;
}

export interface FlagAcquirerRelationModel extends Omit<AcquirerMinimalModel, 'id'> {
  acquirerId: string;
  acquirerCode: string;
}

export interface FlagModel {
  id: string;
  name: string;
  erpCode: number;
  status: StatusEnum | null;

  companies?: FlagCompanyRelationModel[] | null;
  acquirers?: FlagAcquirerRelationModel[] | null;
}

export interface FlagCreateInput {
  name: string;
  erpCode?: number;
  status?: StatusEnum;
}

export interface FlagUpdateInput {
  name?: string;
  erpCode?: number;
  status?: StatusEnum;
}

export type FlagFiltersState = {
  name: string | null;
  erpCode: number | null;
  statusEnum: StatusEnum[] | null;
};

export interface FlagBulkStatusInput {
  ids: string[];
}

export interface FlagApiModel {
  id: string;
  name: string;
  erpCode: number;
  status: StatusEnum | null;

  acquirers?: FlagAcquirerRelationModel[] | null;
  companies?: FlagCompanyRelationModel[] | null;
}

function mapFlagAcquirerRelation(input: FlagAcquirerRelationModel): FlagAcquirerRelationModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

function mapFlagCompanyRelation(input: FlagCompanyRelationModel): FlagCompanyRelationModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapFlagApiModel(input: FlagApiModel): FlagModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
    acquirers: (input.acquirers ?? []).map(mapFlagAcquirerRelation),
    companies: (input.companies ?? []).map(mapFlagCompanyRelation),
  };
}

export function mapFlagApiModels(items: FlagApiModel[] | null | undefined): FlagModel[] {
  return (items ?? []).map(mapFlagApiModel);
}
