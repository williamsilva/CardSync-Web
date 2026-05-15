import { PeriodEnum } from '@models/enums/period.enum';

export interface TransactionsAcqInstallmentAdvancedFilters {
  transactionId?: string;
  cvNsu?: string;
  authorization?: string;
  installment?: string;
  status?: string;

  grossValueStart?: number;
  grossValueEnd?: number;
  feeValueStart?: number;
  feeValueEnd?: number;
  netValueStart?: number;
  netValueEnd?: number;
  adjustmentValueStart?: number;
  adjustmentValueEnd?: number;

  flags?: string[];
  acquirers?: string[];
  companies?: string[];
  establishments?: string[];

  saleDate?: string | string[];
  periodSaleDate?: PeriodEnum;
  paymentDate?: string | string[];
  periodPaymentDate?: PeriodEnum;
  expectedPaymentDate?: string | string[];
  periodExpectedPaymentDate?: PeriodEnum;
  conciliationDate?: string | string[];
  periodConciliationDate?: PeriodEnum;
}

export type TransactionsAcqInstallmentFiltersState = {
  transactionId: string;
  cvNsu: string;
  authorization: string;
  installment: string;
  status: string;

  grossValueStart: number | null;
  grossValueEnd: number | null;
  feeValueStart: number | null;
  feeValueEnd: number | null;
  netValueStart: number | null;
  netValueEnd: number | null;
  adjustmentValueStart: number | null;
  adjustmentValueEnd: number | null;

  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  saleDate: string | string[] | null;
  periodSaleDate: PeriodEnum | null;
  paymentDate: string | string[] | null;
  periodPaymentDate: PeriodEnum | null;
  expectedPaymentDate: string | string[] | null;
  periodExpectedPaymentDate: PeriodEnum | null;
  conciliationDate: string | string[] | null;
  periodConciliationDate: PeriodEnum | null;
};
