import { WritableSignal } from '@angular/core';

import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { AdjustmentsMinimalModel } from './adjustments-minimal.models';
import { CreditOrdersMinimalModel } from './credit-orders-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import {
  SaleSummaryAdvancedFilters,
  SaleSummaryFiltersState,
  createEmptySaleSummaryFiltersState,
} from '@features/filter/sale-summary.filters';

export interface SaleSummaryModel {
  id: string;
  rvNumber: number;
  lineNumber: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  adjustments?: AdjustmentsMinimalModel[] | null;
  creditOrders?: CreditOrdersMinimalModel[] | null;
}

export interface SaleSummaryCreateInput {}

export interface SaleSummaryUpdateInput {}

export interface SaleSummaryApiModel {
  id: string;
  rvNumber: number;
  lineNumber: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
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
  filters.periodRvDate.set(empty.periodRvDate);

  filters.banks.set(empty.banks);
  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.modality.set(empty.modality);
  filters.transactionsStatus.set(empty.transactionsStatus);
  filters.creditOrderStatus.set(empty.creditOrderStatus);
  filters.statusPaymentBank.set(empty.statusPaymentBank);
}
