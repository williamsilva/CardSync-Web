import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum AdjustmentStatusEnum {
  NULL = 'NULL',
  PENDING = 'PENDING',
  ADJUSTED = 'ADJUSTED',
  ANALYSIS = 'ANALYSIS',
  FAVORED_CLIENT = 'FAVORED_CLIENT',
  FAVORED_COMPANY = 'FAVORED_COMPANY',
  NOT_LOCATED_ERP_ACQ = 'NOT_LOCATED_ERP_ACQ',
}

export type AdjustmentStatusInput = AdjustmentStatusEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, AdjustmentStatusEnum> = {
  1: AdjustmentStatusEnum.PENDING,
  2: AdjustmentStatusEnum.ADJUSTED,
  3: AdjustmentStatusEnum.ANALYSIS,
  4: AdjustmentStatusEnum.FAVORED_CLIENT,
  5: AdjustmentStatusEnum.FAVORED_COMPANY,
  6: AdjustmentStatusEnum.NOT_LOCATED_ERP_ACQ,
};

export function normalizeAdjustmentStatusEnum(
  value: AdjustmentStatusInput,
): AdjustmentStatusEnum | null {
  if (value == null) return null;

  if (typeof value === 'number') {
    return STATUS_CODE_MAP[value] ?? null;
  }

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case AdjustmentStatusEnum.PENDING:
      return AdjustmentStatusEnum.PENDING;

    case AdjustmentStatusEnum.ADJUSTED:
      return AdjustmentStatusEnum.ADJUSTED;

    case AdjustmentStatusEnum.ANALYSIS:
      return AdjustmentStatusEnum.ANALYSIS;

    case AdjustmentStatusEnum.FAVORED_CLIENT:
      return AdjustmentStatusEnum.FAVORED_CLIENT;

    case AdjustmentStatusEnum.FAVORED_COMPANY:
      return AdjustmentStatusEnum.FAVORED_COMPANY;

    case AdjustmentStatusEnum.NOT_LOCATED_ERP_ACQ:
      return AdjustmentStatusEnum.NOT_LOCATED_ERP_ACQ;

    default:
      return null;
  }
}

export function adjustmentStatusEnumSeverity(value: AdjustmentStatusInput): CsTagTone {
  switch (normalizeAdjustmentStatusEnum(value)) {
    case AdjustmentStatusEnum.PENDING:
      return 'warn';

    case AdjustmentStatusEnum.ADJUSTED:
      return 'success';

    case AdjustmentStatusEnum.ANALYSIS:
      return 'blue';

    case AdjustmentStatusEnum.FAVORED_CLIENT:
      return 'danger';

    case AdjustmentStatusEnum.FAVORED_COMPANY:
      return 'contrast';

    case AdjustmentStatusEnum.NOT_LOCATED_ERP_ACQ:
      return 'info';

    default:
      return 'bank';
  }
}

export function adjustmentStatusEnumLabel(value: AdjustmentStatusInput, i18n: I18nService): string {
  switch (normalizeAdjustmentStatusEnum(value)) {
    case AdjustmentStatusEnum.PENDING:
      return i18n.tUi('enum.adjustmentStatusEnum.pending');

    case AdjustmentStatusEnum.ADJUSTED:
      return i18n.tUi('enum.adjustmentStatusEnum.adjusted');

    case AdjustmentStatusEnum.ANALYSIS:
      return i18n.tUi('enum.adjustmentStatusEnum.analysis');

    case AdjustmentStatusEnum.FAVORED_CLIENT:
      return i18n.tUi('enum.adjustmentStatusEnum.favoredClient');

    case AdjustmentStatusEnum.FAVORED_COMPANY:
      return i18n.tUi('enum.adjustmentStatusEnum.favoredCompany');

    case AdjustmentStatusEnum.NOT_LOCATED_ERP_ACQ:
      return i18n.tUi('enum.adjustmentStatusEnum.notLocatedErpAcq');

    default:
      return i18n.tUi('enum.adjustmentStatusEnum.unknown');
  }
}

export function allAdjustmentTariffsStatusEnum(): AdjustmentStatusEnum[] {
  return [
    AdjustmentStatusEnum.PENDING,
    AdjustmentStatusEnum.ADJUSTED,
    AdjustmentStatusEnum.ANALYSIS,
    AdjustmentStatusEnum.NOT_LOCATED_ERP_ACQ,
  ];
}

export function allAdjustmentCancellationStatusEnum(): AdjustmentStatusEnum[] {
  return [
    AdjustmentStatusEnum.PENDING,
    AdjustmentStatusEnum.ADJUSTED,
    AdjustmentStatusEnum.NOT_LOCATED_ERP_ACQ,
  ];
}
