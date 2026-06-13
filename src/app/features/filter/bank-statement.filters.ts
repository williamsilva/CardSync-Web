import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';

export type BankStatementFiltersState = {
  launchDate: string | string[] | null;
  periodLaunchDate: PeriodEnum | null;

  statusPaymentBank: StatusPaymentBankEnum[] | null;

  flags: string[] | null;
  banks: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;
};

export type BankStatementAdvancedFilters = Partial<BankStatementFiltersState>;

export type BankStatementAdvancedFilterSignals = {
  [K in keyof BankStatementFiltersState]: WritableSignal<BankStatementFiltersState[K]>;
};

export function createEmptyBankStatementFiltersState(): BankStatementFiltersState {
  return {
    launchDate: null,
    periodLaunchDate: null,

    statusPaymentBank: null,

    flags: null,
    banks: null,
    acquirers: null,
    companies: null,
    establishments: null,
  };
}

export function resetBankStatementAdvancedFilters(
  filters: BankStatementAdvancedFilterSignals,
): void {
  const empty = createEmptyBankStatementFiltersState();

  filters.flags.set(empty.flags);
  filters.banks.set(empty.banks);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.launchDate.set(empty.launchDate);
  filters.periodLaunchDate.set(empty.periodLaunchDate);

  filters.statusPaymentBank.set(empty.statusPaymentBank);
}
