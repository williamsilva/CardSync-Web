import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { ModalityEnum } from '@models/enums/modality.enum';
import { StatusTransactionEnum } from '@models/enums/status-transaction.enum';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';
import { StatusReconciliationEnum } from '@models/enums/status-reconciliation.enum';

export type SaleSummaryFiltersState = {
  periodRvDate: PeriodEnum | null;
  rvDate: string | string[] | null;

  rvNumber: string;

  flags: string[] | null;
  banks: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  modality: ModalityEnum[] | null;
  statusPaymentBank: StatusPaymentBankEnum[] | null;
  transactionsStatus: StatusTransactionEnum[] | null;
  creditOrderStatus: StatusReconciliationEnum[] | null;
};

export type SaleSummaryAdvancedFilters = Partial<SaleSummaryFiltersState>;

export type SaleSummaryAdvancedFilterSignals = {
  [K in keyof SaleSummaryFiltersState]: WritableSignal<SaleSummaryFiltersState[K]>;
};

export function createEmptySaleSummaryFiltersState(): SaleSummaryFiltersState {
  return {
    rvDate: null,
    periodRvDate: null,

    rvNumber: '',

    flags: null,
    banks: null,
    acquirers: null,
    companies: null,
    establishments: null,

    modality: null,
    creditOrderStatus: null,
    statusPaymentBank: null,
    transactionsStatus: null,
  };
}

export function resetSaleSummaryAdvancedFilters(filters: SaleSummaryAdvancedFilterSignals): void {
  const empty = createEmptySaleSummaryFiltersState();

  filters.rvNumber.set(empty.rvNumber);

  filters.rvDate.set(empty.rvDate);
  filters.periodRvDate.set(empty.periodRvDate);

  filters.banks.set(empty.banks);
  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.modality.set(empty.modality);
  filters.creditOrderStatus.set(empty.creditOrderStatus);
  filters.statusPaymentBank.set(empty.statusPaymentBank);
  filters.transactionsStatus.set(empty.transactionsStatus);
}
