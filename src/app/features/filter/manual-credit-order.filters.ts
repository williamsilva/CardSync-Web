import { WritableSignal } from '@angular/core';

import { ModalityEnum } from '@models/enums/modality.enum';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';

export type ManualCreditOrderFiltersState = {
  rvNumber: string;
  companies: string[] | null;
  flags: string[] | null;
  acquirers: string[] | null;
  modality: ModalityEnum[] | null;
  statusPaymentBank: StatusPaymentBankEnum[] | null;
};

export type ManualCreditOrderAdvancedFilters = Partial<ManualCreditOrderFiltersState>;

export type ManualCreditOrderAdvancedFilterSignals = {
  [K in keyof ManualCreditOrderFiltersState]: WritableSignal<ManualCreditOrderFiltersState[K]>;
};

export function createEmptyManualCreditOrderFiltersState(): ManualCreditOrderFiltersState {
  return {
    rvNumber: '',
    companies: null,
    flags: null,
    acquirers: null,
    modality: null,
    statusPaymentBank: null,
  };
}

export function resetManualCreditOrderFilters(
  filters: ManualCreditOrderAdvancedFilterSignals,
): void {
  const empty = createEmptyManualCreditOrderFiltersState();
  filters.rvNumber.set(empty.rvNumber);
  filters.companies.set(empty.companies);
  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.modality.set(empty.modality);
  filters.statusPaymentBank.set(empty.statusPaymentBank);
}
