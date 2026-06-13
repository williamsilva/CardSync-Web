import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum DeleteErpReasonEnum {
  NULL = 'NULL',
  OTHER = 'OTHER',
  UNDONE = 'UNDONE',
  DELETED = 'DELETED',
  DUPLICITY = 'DUPLICITY',
  CANCELED = 'CANCELED',
  INVALID_DATA = 'INVALID_DATA',
  CV_NOT_FOUND_ADQ = 'CV_NOT_FOUND_ADQ',
  CV_NOT_FOUND_ERP = 'CV_NOT_FOUND_ERP',
  TRANSACTION_ALREADY_CONCILIATED = 'TRANSACTION_ALREADY_CONCILIATED',
}

export type DeleteErpReasonInput = DeleteErpReasonEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, DeleteErpReasonEnum> = {
  1: DeleteErpReasonEnum.DUPLICITY,
  2: DeleteErpReasonEnum.UNDONE,
  3: DeleteErpReasonEnum.CV_NOT_FOUND_ADQ,
  4: DeleteErpReasonEnum.CV_NOT_FOUND_ERP,
  5: DeleteErpReasonEnum.INVALID_DATA,
  6: DeleteErpReasonEnum.CANCELED,
  7: DeleteErpReasonEnum.DELETED,
  8: DeleteErpReasonEnum.TRANSACTION_ALREADY_CONCILIATED,
  9: DeleteErpReasonEnum.OTHER,
};

export function normalizeDeleteErpReasonEnum(
  value: DeleteErpReasonInput,
): DeleteErpReasonEnum | null {
  if (value == null) return null;

  if (typeof value === 'number') {
    return STATUS_CODE_MAP[value] ?? null;
  }

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case DeleteErpReasonEnum.UNDONE:
      return DeleteErpReasonEnum.UNDONE;

    case DeleteErpReasonEnum.DUPLICITY:
      return DeleteErpReasonEnum.DUPLICITY;

    case DeleteErpReasonEnum.CV_NOT_FOUND_ADQ:
      return DeleteErpReasonEnum.CV_NOT_FOUND_ADQ;

    case DeleteErpReasonEnum.CV_NOT_FOUND_ERP:
      return DeleteErpReasonEnum.CV_NOT_FOUND_ERP;

    case DeleteErpReasonEnum.CV_NOT_FOUND_ERP:
      return DeleteErpReasonEnum.CV_NOT_FOUND_ERP;

    case DeleteErpReasonEnum.INVALID_DATA:
      return DeleteErpReasonEnum.INVALID_DATA;

    case DeleteErpReasonEnum.CANCELED:
      return DeleteErpReasonEnum.CANCELED;

    case DeleteErpReasonEnum.OTHER:
      return DeleteErpReasonEnum.OTHER;

    case DeleteErpReasonEnum.DELETED:
      return DeleteErpReasonEnum.DELETED;

    case DeleteErpReasonEnum.TRANSACTION_ALREADY_CONCILIATED:
      return DeleteErpReasonEnum.TRANSACTION_ALREADY_CONCILIATED;

    default:
      return null;
  }
}

export function deleteErpReasonEnumSeverity(value: DeleteErpReasonInput): CsTagTone {
  switch (normalizeDeleteErpReasonEnum(value)) {
    case DeleteErpReasonEnum.UNDONE:
      return 'warn';

    case DeleteErpReasonEnum.DUPLICITY:
      return 'success';

    case DeleteErpReasonEnum.CV_NOT_FOUND_ADQ:
      return 'blue';

    case DeleteErpReasonEnum.CV_NOT_FOUND_ERP:
      return 'danger';

    case DeleteErpReasonEnum.INVALID_DATA:
      return 'contrast';

    case DeleteErpReasonEnum.CANCELED:
      return 'info';

    case DeleteErpReasonEnum.DELETED:
      return 'error';

    case DeleteErpReasonEnum.OTHER:
      return 'secondary';

    case DeleteErpReasonEnum.TRANSACTION_ALREADY_CONCILIATED:
      return 'erp';

    default:
      return 'bank';
  }
}

export function deleteErpReasonEnumLabel(value: DeleteErpReasonInput, i18n: I18nService): string {
  switch (normalizeDeleteErpReasonEnum(value)) {
    case DeleteErpReasonEnum.UNDONE:
      return i18n.tUi('enum.deleteErpReasonEnum.undone');

    case DeleteErpReasonEnum.DUPLICITY:
      return i18n.tUi('enum.deleteErpReasonEnum.duplicity');

    case DeleteErpReasonEnum.CV_NOT_FOUND_ADQ:
      return i18n.tUi('enum.deleteErpReasonEnum.cvNotFoundAdq');

    case DeleteErpReasonEnum.CV_NOT_FOUND_ERP:
      return i18n.tUi('enum.deleteErpReasonEnum.cvNotFoundErp');

    case DeleteErpReasonEnum.INVALID_DATA:
      return i18n.tUi('enum.deleteErpReasonEnum.invalid_data');

    case DeleteErpReasonEnum.CANCELED:
      return i18n.tUi('enum.deleteErpReasonEnum.canceled');

    case DeleteErpReasonEnum.DELETED:
      return i18n.tUi('enum.deleteErpReasonEnum.deleted');

    case DeleteErpReasonEnum.TRANSACTION_ALREADY_CONCILIATED:
      return i18n.tUi('enum.deleteErpReasonEnum.transaction_already_conciliated');

    case DeleteErpReasonEnum.OTHER:
      return i18n.tUi('enum.deleteErpReasonEnum.other');

    default:
      return i18n.tUi('enum.deleteErpReasonEnum.unknown');
  }
}

export function allDeleteErpReasonStatusEnum(): DeleteErpReasonEnum[] {
  return [
    DeleteErpReasonEnum.UNDONE,
    DeleteErpReasonEnum.DUPLICITY,
    DeleteErpReasonEnum.CV_NOT_FOUND_ADQ,
    DeleteErpReasonEnum.CANCELED,
    DeleteErpReasonEnum.DELETED,
    DeleteErpReasonEnum.CV_NOT_FOUND_ERP,
    DeleteErpReasonEnum.INVALID_DATA,
    DeleteErpReasonEnum.TRANSACTION_ALREADY_CONCILIATED,
    DeleteErpReasonEnum.OTHER,
  ];
}
