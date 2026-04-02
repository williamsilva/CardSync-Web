import { StatusEnum } from '@models/enums/status.enum';

export interface FlagAdvancedFilters {
  name: string;

  statusEnum?: StatusEnum[] | null;
}
