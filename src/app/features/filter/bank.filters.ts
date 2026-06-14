import { StatusEnum } from '@models/enums/status.enum';

export interface BankAdvancedFilters {
  code?: string;
  name?: string;
  statusEnum?: StatusEnum[] | null;
}
