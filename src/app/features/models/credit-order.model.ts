import { WritableSignal } from '@angular/core';

import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { SalesSummaryMinimalModel } from './sales-summary-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { BankingDomicileMinimalModel } from './bank-domicile-minimal.models';
import {
  CreditOrderAdvancedFilters,
  createEmptyCreditOrderFiltersState,
} from '@features/filter/credit-order.filters';

export interface CreditOrderModel {
  id: string;
  rvNumber: string;
  releaseBankId: string | null;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  salesSummary: SalesSummaryMinimalModel;
  establishment: EstablishmentMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  bankingDomicile: BankingDomicileMinimalModel;
}

export interface CreditOrderCreateInput {}

export interface CreditOrderUpdateInput {}

export interface CreditOrderManualInput {
  summaryIds: string[];
}

export type CreditOrderSkipCode =
  | 'ALL_INSTALLMENTS_COVERED'
  | 'SUMMARY_NOT_FOUND'
  | 'UNEXPECTED_ERROR';

export interface CreditOrderSkipReason {
  rvNumber: string | null;
  code: CreditOrderSkipCode;
  installmentTotal: number;
}

export interface CreditOrderManualResult {
  created: number;
  skipped: number;
  createdIds: string[];
  skippedReasons: CreditOrderSkipReason[];
}

export interface CreditOrderApiModel {
  id: string;
  rvNumber: string;
  releaseBankId: string | null;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  salesSummary: SalesSummaryMinimalModel;
  establishment: EstablishmentMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  bankingDomicile: BankingDomicileMinimalModel;
}

export function mapCreditOrderApiModel(input: CreditOrderApiModel): CreditOrderModel {
  return {
    ...input,
  };
}

export function mapCreditOrderApiModels(
  items: CreditOrderApiModel[] | null | undefined,
): CreditOrderModel[] {
  return (items ?? []).map(mapCreditOrderApiModel);
}

export type CreditOrderAdvancedFilterSignals = {
  [K in keyof CreditOrderAdvancedFilters]: WritableSignal<CreditOrderAdvancedFilters[K]>;
};

export function createEmptyCreditOrderAdvancedFilters(): CreditOrderAdvancedFilters {
  return createEmptyCreditOrderFiltersState();
}
