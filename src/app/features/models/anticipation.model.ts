import { WritableSignal } from '@angular/core';
import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { SalesSummaryMinimalApiModel } from './sales-summary-minimal.models';
import { AnticipationAdvancedFilters } from '@features/filter/anticipation.filters';

export interface AnticipationModel {
  id: string;
  rvNumber: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  salesSummary: SalesSummaryMinimalApiModel;
}

export interface AnticipationCreateInput {}

export interface AnticipationUpdateInput {}

/**
 * Payload bruto vindo da API.
 * Aceita status numérico ou string para tolerar mudanças no backend.
 */
export interface AnticipationApiModel {
  id: string;
  rvNumber: number;

  flag: FlagMinimalModel;
  company: CompanyMinimalModel;
  acquirer: AcquirerMinimalModel;
  processedFile: ProcessedFileMinimalModel;
  establishment: EstablishmentMinimalModel;
  salesSummary: SalesSummaryMinimalApiModel;
}

export function mapAnticipationApiModel(input: AnticipationApiModel): AnticipationModel {
  return {
    ...input,
  };
}

export function mapAnticipationApiModels(
  items: AnticipationApiModel[] | null | undefined,
): AnticipationModel[] {
  return (items ?? []).map(mapAnticipationApiModel);
}

export type AnticipationAdvancedFilterSignals = {
  [K in keyof AnticipationAdvancedFilters]: WritableSignal<AnticipationAdvancedFilters[K]>;
};

export function createEmptyAnticipationAdvancedFilters(): AnticipationAdvancedFilters {
  return {
    rvNumber: null,

    periodReleaseDate: null,
    releaseDate: null,

    modality: null,
    transactionsStatus: null,
    statusPaymentBank: null,

    banks: null,
    flags: null,
    companies: null,
    acquirers: null,
    establishments: null,

    grossValueStart: null,
    grossValueEnd: null,
    discountRateValueStart: null,
    discountRateValueEnd: null,
    releaseValueStart: null,
    releaseValueEnd: null,
    originalCreditValueStart: null,
    originalCreditValueEnd: null,
    advanceDiscountValueStart: null,
    advanceDiscountValueEnd: null,
  };
}
