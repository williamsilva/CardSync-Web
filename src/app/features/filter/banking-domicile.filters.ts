import { WritableSignal } from '@angular/core';

export type BankingDomicileFiltersState = {
  banks: string[] | null;
  companies: string[] | null;
};

export type BankingDomicileAdvancedFilters = Partial<BankingDomicileFiltersState>;

export type BankingDomicileAdvancedFilterSignals = {
  [K in keyof BankingDomicileFiltersState]: WritableSignal<BankingDomicileFiltersState[K]>;
};

export function createEmptyBankingDomicileFiltersState(): BankingDomicileFiltersState {
  return {
    banks: null,
    companies: null,
  };
}

export function resetBankingDomicileAdvancedFilters(
  filters: BankingDomicileAdvancedFilterSignals,
): void {
  const empty = createEmptyBankingDomicileFiltersState();

  filters.banks.set(empty.banks);
  filters.companies.set(empty.companies);
}
