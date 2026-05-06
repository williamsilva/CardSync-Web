import { PeriodEnum } from './enums/period.enum';
import { CaptureEnum } from './enums/capture.enum';
import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ModalityEnum, normalizeModalityEnum } from './enums/modality.enum';

export interface TransactionsErpModel {
  id: string;

  cvNsu: number;
  feeValue: number;
  netValue: number;
  grossValue: number;
  installment: number;
  adjustmentValue: number;

  authorization: string;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  modality: ModalityEnum | null;
  acquirer: AcquirerMinimalModel;
  establishment: EstablishmentMinimalModel;
}

export interface TransactionsErpCreateInput {}

export interface TransactionsErpUpdateInput {}

export type TransactionsErpFiltersState = {
  tid: string;
  cvNsu: string;
  machine: string;
  cardNumber: string;
  authorization: string;
  acquirers: string[] | null;
  capture: CaptureEnum[] | null;
  modality: ModalityEnum[] | null;
  conciliationStatus: string[] | null;

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

export interface TransactionsErpTotalsModel {
  totalGrossValue: number;
  totalFeeValue: number;
  totalNetValue: number;
  totalAdjustments: number;
  quantity: number;
}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface TransactionsErpApiModel {
  id: string;
  cvNsu: number;
  feeValue: number;
  netValue: number;
  grossValue: number;
  installment: number;
  adjustmentValue: number;

  authorization: string;

  modality: ModalityEnum;
  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  establishment: EstablishmentMinimalModel;
}

export function mapTransactionsErpApiModel(input: TransactionsErpApiModel): TransactionsErpModel {
  return {
    ...input,
    modality: normalizeModalityEnum(input.modality),
  };
}

export function mapTransactionsErpApiModels(
  items: TransactionsErpApiModel[] | null | undefined,
): TransactionsErpModel[] {
  return (items ?? []).map(mapTransactionsErpApiModel);
}
