import { WritableSignal } from '@angular/core';

export type BankingDomicileFiltersState = {
  banks: string[] | null;
  companies: string[] | null;
  /** Enviado ao backend como `active` (BankingDomicileFilter.active) — a UI trata o campo como
   *  "status" (ativo/inativo), mas o nome de fio segue o mesmo do filtro Java. */
  active: boolean | null;
};

export type BankingDomicileAdvancedFilters = Partial<BankingDomicileFiltersState>;

export type BankingDomicileAdvancedFilterSignals = {
  [K in keyof BankingDomicileFiltersState]: WritableSignal<BankingDomicileFiltersState[K]>;
};

export function createEmptyBankingDomicileFiltersState(): BankingDomicileFiltersState {
  return {
    banks: null,
    companies: null,
    active: null,
  };
}

export function resetBankingDomicileAdvancedFilters(
  filters: BankingDomicileAdvancedFilterSignals,
): void {
  const empty = createEmptyBankingDomicileFiltersState();

  filters.banks.set(empty.banks);
  filters.companies.set(empty.companies);
  filters.active.set(empty.active);
}
