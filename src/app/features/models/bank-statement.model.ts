import { WritableSignal } from '@angular/core';

import { FlagMinimalModel } from './flag-minimal.models';
import { BankMinimalModel } from './bank-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { BankingDomicileMinimalModel } from './bank-domicile-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';
import {
  BankStatementAdvancedFilters,
  createEmptyBankStatementFiltersState,
} from '@features/filter/bank-statement.filters';

export interface BankStatementModel {
  id: string;
  launchDate: string;
  category: string | null;
  type: string | null;
  document: string | null;
  historicalCodeBank: string | null;
  descriptionHistoricalBank: string | null;
  bankHistory: string | null;
  value: number | null;
  statusPaymentBank: StatusPaymentBankEnum | null;

  flag: FlagMinimalModel | null;
  bank: BankMinimalModel | null;
  company: CompanyMinimalModel | null;
  acquirer: AcquirerMinimalModel | null;
  establishment: EstablishmentMinimalModel | null;
  bankingDomicile: BankingDomicileMinimalModel | null;
  processedFile: ProcessedFileMinimalModel | null;
}

export interface BankStatementApiModel {
  id: string;
  launchDate: string;
  category: string | null;
  type: string | null;
  document: string | null;
  bankHistory: string | null;
  value: number | null;
  historicalCodeBank: string | null;
  descriptionHistoricalBank: string | null;
  statusPaymentBank: StatusPaymentBankEnum | null;

  flag: FlagMinimalModel | null;
  bank: BankMinimalModel | null;
  company: CompanyMinimalModel | null;
  acquirer: AcquirerMinimalModel | null;
  establishment: EstablishmentMinimalModel | null;
  bankingDomicile: BankingDomicileMinimalModel | null;
  processedFile: ProcessedFileMinimalModel | null;
}

export function mapBankStatementApiModel(input: BankStatementApiModel): BankStatementModel {
  return { ...input };
}

export function mapBankStatementApiModels(
  items: BankStatementApiModel[] | null | undefined,
): BankStatementModel[] {
  return (items ?? []).map(mapBankStatementApiModel);
}

export type BankStatementAdvancedFilterSignals = {
  [K in keyof BankStatementAdvancedFilters]: WritableSignal<BankStatementAdvancedFilters[K]>;
};

export function createEmptyBankStatementAdvancedFilters(): BankStatementAdvancedFilters {
  return createEmptyBankStatementFiltersState();
}
