import { WritableSignal } from '@angular/core';
import { PeriodEnum } from '@models/enums/period.enum';
import { CaptureEnum } from '@models/enums/capture.enum';
import { ModalityEnum } from '@models/enums/modality.enum';

export type ContractAuditFiltersState = {
  cvNsu: string;
  authorization: string;

  capture: CaptureEnum[] | null;
  modality: ModalityEnum[] | null;

  grossValueEnd: number | null;
  grossValueStart: number | null;

  appliedFeeValueEnd: number | null;
  appliedFeeValueStart: number | null;

  liquidValueEnd: number | null;
  liquidValueStart: number | null;

  differenceValueEnd: number | null;
  differenceValueStart: number | null;

  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  periodSaleDate: PeriodEnum | null;
  saleDate: string | string[] | null;
};

export type ContractAuditAdvancedFilters = Partial<ContractAuditFiltersState>;

export type ContractAuditAdvancedFilterSignals = {
  [K in keyof ContractAuditFiltersState]: WritableSignal<ContractAuditFiltersState[K]>;
};

export function createEmptyContractAuditFiltersState(): ContractAuditFiltersState {
  return {
    cvNsu: '',
    authorization: '',

    capture: null,
    modality: null,
    acquirers: null,

    flags: null,
    companies: null,
    establishments: null,

    grossValueEnd: null,
    grossValueStart: null,

    liquidValueEnd: null,
    liquidValueStart: null,
    differenceValueEnd: null,
    differenceValueStart: null,
    appliedFeeValueEnd: null,
    appliedFeeValueStart: null,

    saleDate: null,
    periodSaleDate: null,
  };
}

export function resetContractAuditAdvancedFilters(
  filters: ContractAuditAdvancedFilterSignals,
): void {
  const empty = createEmptyContractAuditFiltersState();

  filters.cvNsu.set(empty.cvNsu);
  filters.authorization.set(empty.authorization);

  filters.capture.set(empty.capture);
  filters.modality.set(empty.modality);
  filters.acquirers.set(empty.acquirers);

  filters.grossValueEnd.set(empty.grossValueEnd);
  filters.liquidValueEnd.set(empty.liquidValueEnd);
  filters.grossValueStart.set(empty.grossValueStart);
  filters.differenceValueEnd.set(empty.differenceValueEnd);
  filters.liquidValueStart.set(empty.liquidValueStart);
  filters.differenceValueStart.set(empty.differenceValueStart);
  filters.appliedFeeValueEnd.set(empty.appliedFeeValueEnd);
  filters.appliedFeeValueStart.set(empty.appliedFeeValueStart);

  filters.flags.set(empty.flags);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.saleDate.set(empty.saleDate);
  filters.periodSaleDate.set(empty.periodSaleDate);
}
