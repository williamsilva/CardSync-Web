import { StatusEnum } from '@models/enums/status.enum';
import { TypeEstablishmentEnum } from '@models/enums/type-establishment.enum';

export interface EstablishmentAdvancedFilters {
  pvNumber?: string;
  createdAtTo?: string;
  createdAtFrom?: string;

  statusEnum?: StatusEnum[] | null;
  typeEnum?: TypeEstablishmentEnum[] | null;

  company: string[] | null;
  acquirer: string[] | null;
  createdBy: string[] | null;
}
