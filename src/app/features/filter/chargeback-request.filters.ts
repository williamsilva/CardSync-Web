import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { ModalityEnum } from '@models/enums/modality.enum';
import { ChargebackRequestReasonEnum } from '@models/enums/chargeback-request-reason.enum';
import { ChargebackRequestStatusEnum } from '@models/enums/chargeback-request-status.enum';

export type ChargebackRequestFiltersState = {
  /* Datas */
  saleDate: string | string[] | null;
  periodSaleDate: PeriodEnum | null;

  deadline: string | string[] | null;
  periodDeadline: PeriodEnum | null;

  /* Textos livres */
  cvNsu: string;
  authorization: string;
  rvNumber: string; // Resumo Vendas
  cardNumber: string; // Numero Cartao

  /* Multiselects de entidade */
  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  /* Multiselects de enum */
  modality: ModalityEnum[] | null;
  requestReason: ChargebackRequestReasonEnum[] | null;
  adjustmentStatus: ChargebackRequestStatusEnum[] | null;
};

export type ChargebackRequestAdvancedFilters = Partial<ChargebackRequestFiltersState>;

export type ChargebackRequestAdvancedFilterSignals = {
  [K in keyof ChargebackRequestFiltersState]: WritableSignal<ChargebackRequestFiltersState[K]>;
};

export function createEmptyChargebackRequestFiltersState(): ChargebackRequestFiltersState {
  return {
    saleDate: null,
    periodSaleDate: null,

    deadline: null,
    periodDeadline: null,

    cvNsu: '',
    authorization: '',
    rvNumber: '',
    cardNumber: '',

    flags: null,
    acquirers: null,
    companies: null,
    establishments: null,

    modality: null,
    requestReason: null,
    adjustmentStatus: null,
  };
}

export function resetChargebackRequestAdvancedFilters(
  filters: ChargebackRequestAdvancedFilterSignals,
): void {
  const empty = createEmptyChargebackRequestFiltersState();

  filters.saleDate.set(empty.saleDate);
  filters.periodSaleDate.set(empty.periodSaleDate);

  filters.deadline.set(empty.deadline);
  filters.periodDeadline.set(empty.periodDeadline);

  filters.cvNsu.set(empty.cvNsu);
  filters.authorization.set(empty.authorization);
  filters.rvNumber.set(empty.rvNumber);
  filters.cardNumber.set(empty.cardNumber);

  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.modality.set(empty.modality);
  filters.requestReason.set(empty.requestReason);
  filters.adjustmentStatus.set(empty.adjustmentStatus);
}
