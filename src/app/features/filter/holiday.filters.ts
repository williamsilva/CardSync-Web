import { StatusEnum } from '@models/enums/status.enum';

export interface HolidayAdvancedFilters {
  name?: string;
  holidayDateFrom?: string;
  holidayDateTo?: string;
  statusEnum?: StatusEnum[] | null;
}
