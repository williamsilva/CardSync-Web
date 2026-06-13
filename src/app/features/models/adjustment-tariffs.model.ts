import { FlagMinimalModel } from './flag-minimal.models';
import { CompanyMinimalModel } from './company-minimal.models';
import { AcquirerMinimalModel } from './acquirer-minimal.models';
import { EstablishmentMinimalModel } from './establishment-minimal.models';
import { ProcessedFileMinimalModel } from './processed-file-minimal.models';
import { AdjustmentReasonEnum } from '@models/enums/adjustment-reason.enum';
import { AdjustmentStatusEnum } from '@models/enums/adjustment-status.enum';

export interface AdjustmentTariffsModel {
  id: string;
  adjustmentDate: string | null;
  creditDate: string | null;
  rvNumber: string | null;
  adjustmentValue: number | null;
  reason: AdjustmentReasonEnum | null;
  status: AdjustmentStatusEnum | null;

  flag: FlagMinimalModel | null;
  company: CompanyMinimalModel | null;
  acquirer: AcquirerMinimalModel | null;
  establishment: EstablishmentMinimalModel | null;
  processedFile: ProcessedFileMinimalModel | null;
}

export interface AdjustmentTariffsApiModel {
  id: string;
  adjustmentDate: string | null;
  creditDate: string | null;
  rvNumber: string | null;
  adjustmentValue: number | null;
  reason: string | null;
  status: string | null;

  flag: FlagMinimalModel | null;
  company: CompanyMinimalModel | null;
  acquirer: AcquirerMinimalModel | null;
  establishment: EstablishmentMinimalModel | null;
  processedFile: ProcessedFileMinimalModel | null;
}

export function mapAdjustmentTariffsApiModel(
  input: AdjustmentTariffsApiModel,
): AdjustmentTariffsModel {
  return {
    ...input,
    reason: (input.reason as AdjustmentReasonEnum) ?? null,
    status: (input.status as AdjustmentStatusEnum) ?? null,
  };
}

export function mapAdjustmentTariffsApiModels(
  items: AdjustmentTariffsApiModel[] | null | undefined,
): AdjustmentTariffsModel[] {
  return (items ?? []).map(mapAdjustmentTariffsApiModel);
}
