export interface BankModel {
  id: string;
  name: string;
}

export interface BankCreateInput {}

export interface BankUpdateInput {}

export interface BankBulkStatusInput {
  ids: string[];
}

export type BankFiltersState = {
  name: string | null;
};

export interface BankApiModel {
  id: string;
  name: string;
}

export function mapBankApiModel(input: BankApiModel): BankModel {
  return {
    ...input,
  };
}

export function mapBankApiModels(items: BankApiModel[] | null | undefined): BankModel[] {
  return (items ?? []).map(mapBankApiModel);
}
