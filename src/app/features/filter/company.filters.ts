import { StatusEnum } from '@models/enums/status.enum';
import { UserMinimalModel } from '@models/user-minimal.models';
import { TypeCompanyEnum } from '@models/enums/type-company.enum';

export interface CompanyAdvancedFilters {
  cnpj: string;
  fantasyName: string;
  socialReason: string;

  createdAtTo?: string;
  createdAtFrom?: string;

  statusEnum?: StatusEnum[] | null;
  createdBy: UserMinimalModel | null;
  typeEnum?: TypeCompanyEnum[] | null;
}
