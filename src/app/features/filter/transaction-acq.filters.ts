import { PeriodEnum } from '@models/enums/period.enum';
import { CaptureEnum } from '@models/enums/capture.enum';
import { ModalityEnum } from '@models/enums/modality.enum';

export interface TransactionsAcquirersSalesAdvancedFilters {}

export type TransactionsAcquirersSalesFiltersState = {
  tid: string;
  cvNsu: string;
  machine: string;
  cardNumber: string;
  authorization: string;
  acquirers: string[] | null;
  capture: CaptureEnum[] | null;
  modality: ModalityEnum[] | null;
  transactionStatus: string[] | null;

  grossValueEnd?: number | null;
  liquidValueEnd?: number | null;
  liquidValueStart?: number | null;
  grossValueStart?: number | null;
  discountValueEnd?: number | null;
  discountValueStart?: number | null;
  adjustmentValueEnd?: number | null;
  adjustmentValueStart?: number | null;

  flags: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  periodSaleDate: PeriodEnum | null;
  saleDate: string | string[] | null;

  periodPaymentDate: PeriodEnum | null;
  paymentDate: string | string[] | null;

  periodExpectedPaymentDate: PeriodEnum | null;
  expectedPaymentDate: string | string[] | null;

  periodConciliationDate: PeriodEnum | null;
  conciliationDate: string | string[] | null;
};
