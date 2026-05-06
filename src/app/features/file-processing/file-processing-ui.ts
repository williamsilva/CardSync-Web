import { CsTagTone } from '@shared/ui';
import { ErpCommercialStatus, FileProcessingStatus } from '@models/file-processing.models';

export type TagSeverity = CsTagTone;

export function fileStatusSeverity(status?: FileProcessingStatus | string | null): TagSeverity {
  switch (status) {
    case 'PROCESSED':
      return 'success';
    case 'PROCESSED_WITH_WARNINGS':
      return 'warn';
    case 'ERROR':
      return 'danger';
    case 'DUPLICATE':
      return 'secondary';
    case 'INVALID':
      return 'danger';
    case 'PROCESSING':
      return 'info';
    case 'RECEIVED':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function commercialStatusSeverity(
  status?: ErpCommercialStatus | string | null,
): TagSeverity {
  switch (status) {
    case 'OK':
      return 'success';
    case 'PENDING_CONTRACT':
      return 'warn';
    case 'PENDING_COMPANY':
      return 'danger';
    case 'PENDING_ESTABLISHMENT':
      return 'danger';
    case 'PENDING_BUSINESS_CONTEXT':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function boolSeverity(value?: boolean | null): TagSeverity {
  if (value === true) return 'success';
  if (value === false) return 'danger';
  return 'secondary';
}

export function formatCurrency(value?: number | null): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
}
