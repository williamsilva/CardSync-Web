import { PeriodEnum } from './enums/period.enum';
import { UserMinimalModel } from './user-minimal.models';
import { EstablishmentModel } from './establishment.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { ModalityEnum, normalizeModalityEnum } from './enums/modality.enum';
import { ContractEnum, normalizeContractEnum } from './enums/contract.enum';

export interface ContractFlagMinimalModel {
  id: string;
  name: string;
  erpCode?: number | null;
  status?: ContractEnum | null;
}

export interface ContractRateModel {
  id?: string;
  modality: ModalityEnum | null;
  rate: number | null;
  paymentTermDays: number | null;
  rateEcommerce: number | null;
  paymentTermDaysEcommerce: number | null;
}

export interface ContractFlagModel {
  id?: string;
  flag: ContractFlagMinimalModel | null;
  contractRates: ContractRateModel[];
}

export interface ContractModel {
  id: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  status?: ContractEnum | null;
  createdBy?: UserMinimalModel | null;
  updatedBy?: UserMinimalModel | null;
  company?: CompanyMinimalModel | null;
  acquirer?: AcquirerMinimalModel | null;
  establishment?: Pick<EstablishmentModel, 'id' | 'pvNumber' | 'status' | 'type'> | null;
  contractFlags?: ContractFlagModel[] | null;
}

export interface ContractRateInput {
  modality: ModalityEnum;
  rate?: number | null;
  paymentTermDays?: number | null;
  rateEcommerce?: number | null;
  paymentTermDaysEcommerce?: number | null;
}

export interface ContractFlagInput {
  flagId: string;
  contractRates: ContractRateInput[];
}

export interface ContractCreateInput {
  description: string;
  startDate: string;
  endDate?: string | null;
  companyId?: string | null;
  acquirerId: string;
  establishmentId?: string | null;
  status?: ContractEnum | null;
  contractFlags: ContractFlagInput[];
}

export interface ContractUpdateInput {
  description?: string;
  startDate?: string;
  endDate?: string | null;
  companyId?: string | null;
  acquirerId?: string;
  establishmentId?: string | null;
  status?: ContractEnum | null;
  contractFlags?: ContractFlagInput[];
}

export type ContractFiltersState = {
  description: string;
  contractEnum: ContractEnum[] | null;

  company: string[] | null;
  acquirer: string[] | null;
  createdAt: string[] | null;
  establishment: string[] | null;
  createdBy: string[] | null;

  periodStartDate: PeriodEnum | null;
  startDate: string | string[] | null;

  periodEndDate: PeriodEnum | null;
  endDate: string | string[] | null;
};

export interface ContractBulkStatusInput {
  ids: string[];
}

export interface ContractRateApiModel {
  id?: string;
  modality: ModalityEnum | string | null;
  rate?: number | null;
  paymentTermDays?: number | null;
  rateEcommerce?: number | null;
  paymentTermDaysEcommerce?: number | null;
}

export interface ContractFlagApiModel {
  id?: string;
  flag: ContractFlagMinimalModel | null;
  contractRates?: ContractRateApiModel[] | null;
}

export interface ContractApiModel {
  id: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  status?: ContractEnum | null;
  createdBy?: UserMinimalModel | null;
  updatedBy?: UserMinimalModel | null;
  company?: CompanyMinimalModel | null;
  acquirer?: AcquirerMinimalModel | null;
  establishment?: Pick<EstablishmentModel, 'id' | 'pvNumber' | 'status' | 'type'> | null;
  contractFlags?: ContractFlagApiModel[] | null;
}

function mapContractFlagMinimalModel(
  input: ContractFlagMinimalModel | null | undefined,
): ContractFlagMinimalModel | null {
  if (!input) return null;

  return {
    ...input,
    status: normalizeContractEnum(input.status),
  };
}

function mapContractRateApiModel(input: ContractRateApiModel): ContractRateModel {
  return {
    ...input,
    modality: normalizeModalityEnum(input.modality),
    rate: input.rate ?? null,
    paymentTermDays: input.paymentTermDays ?? null,
    rateEcommerce: input.rateEcommerce ?? null,
    paymentTermDaysEcommerce: input.paymentTermDaysEcommerce ?? null,
  };
}

function mapContractFlagApiModel(input: ContractFlagApiModel): ContractFlagModel {
  return {
    ...input,
    flag: mapContractFlagMinimalModel(input.flag),
    contractRates: (input.contractRates ?? []).map(mapContractRateApiModel),
  };
}

export function mapContractApiModel(input: ContractApiModel): ContractModel {
  return {
    ...input,
    status: normalizeContractEnum(input.status),
    contractFlags: (input.contractFlags ?? []).map(mapContractFlagApiModel),
  };
}

export function mapContractApiModels(
  items: ContractApiModel[] | null | undefined,
): ContractModel[] {
  return (items ?? []).map(mapContractApiModel);
}
