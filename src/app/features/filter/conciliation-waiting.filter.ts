import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { CaptureEnum } from '@models/enums/capture.enum';
import { ModalityEnum } from '@models/enums/modality.enum';
import { StatusTransactionReasonEnum } from '@models/enums/status-transaction-reason.enum';

export type ConciliationWaitingFiltersState = {
  tid: string;
  cvNsu: string;
  authorization: string;
  statusTransactionReason: StatusTransactionReasonEnum[] | null;

  grossValueEnd: number | null;
  liquidValueEnd: number | null;
  grossValueStart: number | null;
  liquidValueStart: number | null;

  capture: CaptureEnum[] | null;
  modality: ModalityEnum[] | null;

  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  periodSaleDate: PeriodEnum | null;
  saleDate: string | string[] | null;
};

export type ConciliationWaitingAdvancedFilters = Partial<ConciliationWaitingFiltersState>;

export type ConciliationWaitingAdvancedFilterSignals = {
  [K in keyof ConciliationWaitingFiltersState]: WritableSignal<ConciliationWaitingFiltersState[K]>;
};

export function createEmptyConciliationWaitingFiltersState(): ConciliationWaitingFiltersState {
  return {
    tid: '',
    cvNsu: '',
    authorization: '',

    capture: null,
    modality: null,
    grossValueEnd: null,
    liquidValueEnd: null,
    grossValueStart: null,
    liquidValueStart: null,
    statusTransactionReason: null,

    flags: null,
    companies: null,
    acquirers: null,
    establishments: null,

    saleDate: null,
    periodSaleDate: null,
  };
}

export function resetConciliationWaitingAdvancedFilters(
  filters: ConciliationWaitingAdvancedFilterSignals,
): void {
  const empty = createEmptyConciliationWaitingFiltersState();

  filters.tid.set(empty.tid);
  filters.cvNsu.set(empty.cvNsu);
  filters.authorization.set(empty.authorization);

  filters.capture.set(empty.capture);
  filters.modality.set(empty.modality);

  filters.grossValueEnd.set(empty.grossValueEnd);
  filters.liquidValueEnd.set(empty.liquidValueEnd);
  filters.grossValueStart.set(empty.grossValueStart);
  filters.liquidValueStart.set(empty.liquidValueStart);

  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.saleDate.set(empty.saleDate);
  filters.periodSaleDate.set(empty.periodSaleDate);
}
