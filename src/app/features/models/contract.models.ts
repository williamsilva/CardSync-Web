import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

export interface ContractModel {
  id: string;
  name: string;

  status?: StatusEnum | null;
}

export interface ContractCreateInput {}

export interface ContractUpdateInput {}

export type ContractFiltersState = {
  name: string;

  statusEnum: StatusEnum[] | null;
};

export interface ContractBulkStatusInput {
  ids: string[];
}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface ContractApiModel {
  id: string;
  name: string;

  status?: StatusEnum | null;
}

export function mapContractApiModel(input: ContractApiModel): ContractModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapContractApiModels(
  items: ContractApiModel[] | null | undefined,
): ContractModel[] {
  return (items ?? []).map(mapContractApiModel);
}
