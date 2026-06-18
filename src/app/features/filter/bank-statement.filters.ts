import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';

export type BankStatementFiltersState = {
  releaseDate: string | string[] | null;
  periodReleaseDate: PeriodEnum | null;

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
    releaseDate: null,
    periodReleaseDate: null,

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

  filters.releaseDate.set(empty.releaseDate);
  filters.periodReleaseDate.set(empty.periodReleaseDate);

  filters.statusPaymentBank.set(empty.statusPaymentBank);
}
