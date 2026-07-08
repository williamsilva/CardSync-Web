import { ReleaseCategoryEnum } from './enums/release-category.enum';
import { ModalityPaymentBankEnum } from './enums/modality-payment-bank.enum';

export interface ReleaseBankManualInput {
  companyId: string;
  bankingDomicileId: string;
  releaseDate: string;
  releaseValue: number;
  releaseCategory: ReleaseCategoryEnum;
  modalityPaymentBank: ModalityPaymentBankEnum;
  description?: string | null;
  document?: string | null;
  historicalCodeBank?: number | null;
  acquirerId?: string | null;
  establishmentId?: string | null;
  flagId?: string | null;
}

export interface ReleaseBankManualResult {
  id: string;
}
