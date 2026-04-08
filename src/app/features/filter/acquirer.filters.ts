import { StatusEnum } from '@models/enums/status.enum';

export interface AcquirerAdvancedFilters {
  cnpj: string;
  fantasyName: string;
  socialReason: string;

  createdAtTo?: string;
  createdAtFrom?: string;

  statusEnum?: StatusEnum[] | null;

  createdBy: string[] | null;
}
