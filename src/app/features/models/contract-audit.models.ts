import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { TransactionsErpModel } from './transactions-erp.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';

export interface ContractAuditModel {
  id: string;

  grossValue: number;
  liquidValue: number;
  differenceValue: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  transactionErp: TransactionsErpModel;
  establishment: EstablishmentMinimalModel;
}

export interface ContractAuditModelCreateInput {}

export interface ContractAuditModelUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface ContractAuditApiModel {
  id: string;

  grossValue: number;
  liquidValue: number;
  differenceValue: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  transactionErp: TransactionsErpModel;
  establishment: EstablishmentMinimalModel;
}

export function mapContractAuditModelApiModel(input: ContractAuditApiModel): ContractAuditModel {
  return {
    ...input,
  };
}

export function mapContractAuditModelApiModels(
  items: ContractAuditApiModel[] | null | undefined,
): ContractAuditModel[] {
  return (items ?? []).map(mapContractAuditModelApiModel);
}
