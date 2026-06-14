import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';

export interface HolidayModel {
  id: string;
  name: string;
  holidayDate: string | null;
  status: StatusEnum | null;
  statusDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface HolidayCreateInput {
  name: string;
  holidayDate: string;
}

export interface HolidayUpdateInput {
  name?: string;
  holidayDate?: string;
  status?: StatusEnum;
}

export interface HolidayBulkStatusInput {
  ids: string[];
}

export type HolidayFiltersState = {
  name: string;
  statusEnum: StatusEnum[] | null;
  holidayDateRange: [string, string] | null;
};

export interface HolidayApiModel {
  id: string;
  name: string;
  holidayDate: string | null;
  status: StatusEnum;
  statusDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export function mapHolidayApiModel(input: HolidayApiModel): HolidayModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
  };
}

export function mapHolidayApiModels(items: HolidayApiModel[] | null | undefined): HolidayModel[] {
  return (items ?? []).map(mapHolidayApiModel);
}
