import { StatusEnum } from '@models/enums/status.enum';
import { TypeCompanyEnum } from '@models/enums/type-company.enum';

export interface CompanyAdvancedFilters {
  cnpj: string;
  fantasyName: string;
  socialReason: string;

  createdAtTo?: string;
  createdAtFrom?: string;

  createdBy: string[] | null;
  statusEnum?: StatusEnum[] | null;
  typeEnum?: TypeCompanyEnum[] | null;
}
