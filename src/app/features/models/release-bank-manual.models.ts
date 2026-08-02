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

export interface ReleaseBankManualTextImportInput {
  companyId: string;
  bankingDomicileId: string;
  releaseDate: string;
  description: string;
  releaseValue: number;
}

export interface ReleaseBankManualImportResult {
  id: string;
  acquirerName: string | null;
  flagName: string | null;
  modalityPaymentBank: ModalityPaymentBankEnum | null;
  establishmentPvNumber: number | null;
}
