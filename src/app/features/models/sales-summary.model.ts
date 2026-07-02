import { WritableSignal } from '@angular/core';

import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { AdjustmentsMinimalModel } from './adjustments-minimal.models';
import { CreditOrdersMinimalModel } from './credit-orders-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import {
  SaleSummaryFiltersState,
  SaleSummaryAdvancedFilters,
  createEmptySaleSummaryFiltersState,
} from '@features/filter/sale-summary.filters';
import { BankingDomicileModel } from './banking-domicile.models';

export interface SaleSummaryModel {
  id: string;
  rvDate: string;
  rvNumber: string;
  lineNumber: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  bankingDomicile: BankingDomicileModel;
  processedFile: ProcessedFileMinimalModel;
  adjustments?: AdjustmentsMinimalModel[] | null;
  creditOrders?: CreditOrdersMinimalModel[] | null;
}

export interface SaleSummaryCreateInput {}

export interface SaleSummaryUpdateInput {}

export interface SalesSummaryManualTransactionInput {
  nsu?: number | null;
  cardNumber?: string | null;
  authorization?: string | null;
  referenceNumber?: string | null;
  grossValue?: number | null;
  discountValue?: number | null;
  liquidValue?: number | null;
  tipValue?: number | null;
  saleDate?: string | null;
  creditDate?: string | null;
  installment?: number | null;
  modality?: number | null;
  flagName?: string | null;
  tid?: string | null;
  capture?: number | null;
}

export interface SalesSummaryManualCreateInput {
  pvNumber: number;
  acquirerId: string;
  companyId?: string | null;
  rvNumber: number;
  rvDate: string;
  grossValue: number;
  discountValue?: number | null;
  liquidValue?: number | null;
  tipValue?: number | null;
  rejectedValue?: number | null;
  adjustedValue?: number | null;
  numberCvNsu?: number | null;
  firstInstallmentCreditDate?: string | null;
  summaryType?: string | null;
  transactions?: SalesSummaryManualTransactionInput[];
}

export interface SaleSummaryApiModel {
  id: string;
  rvDate: string;
  rvNumber: string;
  lineNumber: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  bankingDomicile: BankingDomicileModel;
  processedFile: ProcessedFileMinimalModel;
}

export function mapSaleSummaryApiModel(input: SaleSummaryApiModel): SaleSummaryModel {
  return {
    ...input,
  };
}

export function mapSaleSummaryApiModels(
  items: SaleSummaryApiModel[] | null | undefined,
): SaleSummaryModel[] {
  return (items ?? []).map(mapSaleSummaryApiModel);
}

export type SaleSummaryAdvancedFilterSignals = {
  [K in keyof SaleSummaryFiltersState]: WritableSignal<SaleSummaryFiltersState[K]>;
};

export function createEmptySaleSummaryAdvancedFilters(): SaleSummaryAdvancedFilters {
  return createEmptySaleSummaryFiltersState();
}

export function resetSaleSummaryAdvancedFilters(filters: SaleSummaryAdvancedFilterSignals): void {
  const empty = createEmptySaleSummaryFiltersState();

  filters.rvDate.set(empty.rvDate);
  filters.rvNumber.set(empty.rvNumber);
  filters.periodRvDate.set(empty.periodRvDate);

  filters.banks.set(empty.banks);
  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);

  filters.modality.set(empty.modality);
  filters.creditOrderStatus.set(empty.creditOrderStatus);
  filters.statusPaymentBank.set(empty.statusPaymentBank);
  filters.transactionsStatus.set(empty.transactionsStatus);
}
