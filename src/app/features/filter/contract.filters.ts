import { StatusEnum } from '@models/enums/status.enum';

export interface ContractAdvancedFilters {
  description?: string;

  statusEnum?: StatusEnum[] | null;
}
