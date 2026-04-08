import { normalizeStatusEnum, StatusEnum } from './enums/status.enum';
import { normalizeTypeCompanyEnum, TypeCompanyEnum } from './enums/type-company.enum';

export interface CompanyMinimalModel {
  id: string;
  cnpj: string;
  fantasyName: string;
  socialReason: string;

  status: StatusEnum | null;
  type: TypeCompanyEnum | null;
}

export function mapCompanyMinimalModel(input: CompanyMinimalModel): CompanyMinimalModel {
  return {
    ...input,
    status: normalizeStatusEnum(input.status),
    type: normalizeTypeCompanyEnum(input.type),
  };
}

export function mapCompanyMinimalModels(
  items: CompanyMinimalModel[] | null | undefined,
): CompanyMinimalModel[] {
  return (items ?? []).map(mapCompanyMinimalModel);
}
