import { CompanyModel } from '@models/company.models';
import { StatusEnum } from '@models/enums/status.enum';
import { UserMinimalModel } from '@models/user-minimal.models';

export interface AcquirerAdvancedFilters {
  cnpj: string;
  fantasyName: string;
  socialReason: string;

  createdAtTo?: string;
  createdAtFrom?: string;

  statusEnum?: StatusEnum[] | null;

  //flags: Flags[];
  //companies: CompanyModel[];
  //establishments: Establishment[];
  createdBy: UserMinimalModel | null;
}
