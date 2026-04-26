import { PeriodEnum } from '@models/enums/period.enum';
import { ContractEnum } from '@models/enums/contract.enum';

export interface ContractAdvancedFilters {
  description?: string;

  company: string[] | null;
  acquirer: string[] | null;
  establishment: string[] | null;
  contractEnum?: ContractEnum[] | null;

  periodStartDate: PeriodEnum | null;
  startDate: string | string[] | null;

  createdAt: string[] | null;
  createdBy: string[] | null;
  periodEndDate: PeriodEnum | null;
  endDate: string | string[] | null;
}
