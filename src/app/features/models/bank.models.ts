import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';

export interface BankModel {
  id: string;
  code: string;
  name: string;
  status: StatusEnum | null;
  statusDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BankCreateInput {
  code: string;
  name: string;
}

export interface BankUpdateInput {
  code?: string;
  name?: string;
  status?: StatusEnum;
}

export interface BankBulkStatusInput {
  ids: string[];
}

export type BankFiltersState = {
  code: string;
  name: string;
  statusEnum: StatusEnum[] | null;
};

export interface BankApiModel {
  id: string;
  code: string;
  name: string;
  status: StatusEnum;
  statusDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function mapBankApiModel(input: BankApiModel): BankModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapBankApiModels(items: BankApiModel[] | null | undefined): BankModel[] {
  return (items ?? []).map(mapBankApiModel);
}
