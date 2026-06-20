import { WritableSignal } from '@angular/core';
import { ModalityPaymentBankEnum } from '@models/enums/modality-payment-bank.enum';

import { PeriodEnum } from '@models/enums/period.enum';
import { ReleaseCategoryEnum } from '@models/enums/release-category.enum';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';

export type BankStatementFiltersState = {
  releaseDate: string | string[] | null;
  periodReleaseDate: PeriodEnum | null;

  releaseCategory: ReleaseCategoryEnum[] | null;
  statusPaymentBank: StatusPaymentBankEnum[] | null;
  modalityPaymentBank: ModalityPaymentBankEnum[] | null;

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

    releaseCategory: null,
    statusPaymentBank: null,
    modalityPaymentBank: null,

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

  filters.releaseCategory.set(empty.releaseCategory);
  filters.statusPaymentBank.set(empty.statusPaymentBank);
  filters.modalityPaymentBank.set(empty.modalityPaymentBank);
}
