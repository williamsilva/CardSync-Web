import { StatusEnum } from './enums/status.enum';
import { CompanyMinimalModel, mapCompanyMinimalModel } from './company-minimal.models';

export interface BankMinimalModel {
  id: string;
  name?: string | null;
  code?: string | null;
}

export interface BankingDomicileModel {
  id: string;
  agency: number;
  agencyDigit?: string | null;
  currentAccount: number;
  accountDigit?: string | null;
  accountOpeningDate: string | null;
  accountClosingDate: string | null;
  expectsFile: boolean;
  status?: StatusEnum | null;
  bankId?: string | null;
  bank?: BankMinimalModel | null;
  company: CompanyMinimalModel | null;
}

export interface BankingDomicileCreateInput {
  agency: number;
  agencyDigit?: string;
  currentAccount: number;
  accountDigit?: string;
  accountOpeningDate: string;
  accountClosingDate?: string | null;
  expectsFile: boolean;
  bankId: string;
  companyId: string;
}

export interface BankingDomicileUpdateInput {
  agency?: number;
  agencyDigit?: string;
  currentAccount?: number;
  accountDigit?: string;
  accountOpeningDate?: string;
  accountClosingDate?: string;
  expectsFile?: boolean;
  bankId?: string;
  companyId?: string;
  status?: StatusEnum;
}

export interface BankingDomicileBulkInput {
  ids: string[];
}

export interface BankingDomicileApiModel {
  id: string;
  agency: number;
  agencyDigit?: string | null;
  currentAccount: number;
  accountDigit?: string | null;
  accountOpeningDate?: string | null;
  accountClosingDate?: string | null;
  expectsFile?: boolean | null;
  status?: StatusEnum | null;
  bankId?: string | null;
  bank?: BankMinimalModel | null;
  company: CompanyMinimalModel | null;
}

export function mapBankingDomicileApiModel(input: BankingDomicileApiModel): BankingDomicileModel {
  return {
    ...input,
    accountOpeningDate: input.accountOpeningDate ?? null,
    accountClosingDate: input.accountClosingDate ?? null,
    expectsFile: input.expectsFile ?? true,
    bankId: input.bankId ?? input.bank?.id ?? null,
    bank: input.bank ?? null,
    company: input.company ? mapCompanyMinimalModel(input.company) : null,
  };
}

export function mapBankingDomicileApiModels(
  items: BankingDomicileApiModel[] | null | undefined,
): BankingDomicileModel[] {
  return (items ?? []).map(mapBankingDomicileApiModel);
}
