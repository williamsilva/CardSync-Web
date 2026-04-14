import { StatusEnum } from '@models/enums/status.enum';

export interface ContractAdvancedFilters {
  name: string;

  statusEnum?: StatusEnum[] | null;
}
