import { PeriodEnum } from '@models/enums/period.enum';
import { StatusEnum } from '@models/enums/status.enum';
import { TypeEstablishmentEnum } from '@models/enums/type-establishment.enum';

export interface EstablishmentAdvancedFilters {
  pvNumber?: string;

  statusEnum?: StatusEnum[] | null;
  typeEnum?: TypeEstablishmentEnum[] | null;

  company: string[] | null;
  acquirer: string[] | null;
  createdBy: string[] | null;

  periodCreatedAt?: PeriodEnum | null;
  createdAt?: string | string[] | null;
}
