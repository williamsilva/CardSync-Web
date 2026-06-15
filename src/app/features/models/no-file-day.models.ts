import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';
import { FileGroupEnum } from './enums/file-group.enum';
import { NoFileDayTypeEnum, normalizeNoFileDayTypeEnum } from './enums/no-file-day-type.enum';
import { AcquirerFileTypeEnum } from './enums/acquirer-file-type.enum';
import { BankMinimalModel, BankMinimalApiModel, mapBankMinimalApiModel } from './bank-minimal.models';
import { AcquirerMinimalModel, mapAcquirerMinimalModel } from './acquirer-minimal.models';
import { BankingDomicileModel, BankingDomicileApiModel, mapBankingDomicileApiModel } from './banking-domicile.models';

export interface NoFileDayModel {
  id: string;
  description: string;
  status: StatusEnum | null;
  fileGroup: FileGroupEnum | null;
  dayType: NoFileDayTypeEnum | null;
  bank: BankMinimalModel | null;
  bankingDomicile: BankingDomicileModel | null;
  acquirer: AcquirerMinimalModel | null;
  acquirerFileType?: AcquirerFileTypeEnum | null;
  noFileDate: string | null;
  statusDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface NoFileDayCreateInput {
  noFileDate: string;
  description: string;
  dayType: NoFileDayTypeEnum;
  fileGroup: FileGroupEnum;
  bankingDomicileId?: string;
  acquirerId?: string;
  acquirerFileType?: AcquirerFileTypeEnum;
}

export interface NoFileDayUpdateInput {
  noFileDate?: string;
  description?: string;
  dayType?: NoFileDayTypeEnum;
  fileGroup?: FileGroupEnum;
  bankingDomicileId?: string;
  acquirerId?: string;
  acquirerFileType?: AcquirerFileTypeEnum;
  status?: StatusEnum;
}

export interface NoFileDayBulkStatusInput {
  ids: string[];
}

export type NoFileDayFiltersState = {
  description: string;
  statusEnum: StatusEnum[] | null;
  noFileDateRange: [string, string] | null;
  dayType: NoFileDayTypeEnum[] | null;
  fileGroup: FileGroupEnum[] | null;
};

export interface NoFileDayApiModel {
  id: string;
  description: string;
  status: StatusEnum;
  fileGroup: FileGroupEnum;
  dayType: NoFileDayTypeEnum;
  bank: BankMinimalApiModel | null;
  bankingDomicile: BankingDomicileApiModel | null;
  acquirer: AcquirerMinimalModel | null;
  acquirerFileType?: AcquirerFileTypeEnum | null;
  noFileDate: string | null;
  statusDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function mapNoFileDayApiModel(input: NoFileDayApiModel): NoFileDayModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
    dayType: normalizeNoFileDayTypeEnum(input.dayType),
    bank: input.bank ? mapBankMinimalApiModel(input.bank) : null,
    bankingDomicile: input.bankingDomicile ? mapBankingDomicileApiModel(input.bankingDomicile) : null,
    acquirer: input.acquirer ? mapAcquirerMinimalModel(input.acquirer) : null,
  };
}

export function mapNoFileDayApiModels(items: NoFileDayApiModel[] | null | undefined): NoFileDayModel[] {
  return (items ?? []).map(mapNoFileDayApiModel);
}
