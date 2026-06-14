import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';
import { FileGroupEnum } from './enums/file-group.enum';
import { NoFileDayTypeEnum, normalizeNoFileDayTypeEnum } from './enums/no-file-day-type.enum';
import { BankMinimalModel, BankMinimalApiModel, mapBankMinimalApiModel } from './bank-minimal.models';
import { AcquirerMinimalModel, mapAcquirerMinimalModel } from './acquirer-minimal.models';

export interface NoFileDayModel {
  id: string;
  description: string;
  status: StatusEnum | null;
  fileGroup: FileGroupEnum | null;
  dayType: NoFileDayTypeEnum | null;
  bank: BankMinimalModel | null;
  acquirer: AcquirerMinimalModel | null;
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
  bankId?: string;
  acquirerId?: string;
}

export interface NoFileDayUpdateInput {
  noFileDate?: string;
  description?: string;
  dayType?: NoFileDayTypeEnum;
  fileGroup?: FileGroupEnum;
  bankId?: string;
  acquirerId?: string;
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
  acquirer: AcquirerMinimalModel | null;
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
    acquirer: input.acquirer ? mapAcquirerMinimalModel(input.acquirer) : null,
  };
}

export function mapNoFileDayApiModels(items: NoFileDayApiModel[] | null | undefined): NoFileDayModel[] {
  return (items ?? []).map(mapNoFileDayApiModel);
}
