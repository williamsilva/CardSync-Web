import { CsTagTone } from '@shared/ui';

export type TagSeverity = CsTagTone;

export function formatCurrency(value?: number | null): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
}

export function signedCurrency(value?: number | null): string {
  const amount = value ?? 0;
  const formatted = formatCurrency(Math.abs(amount));
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatPercent(value?: number | null): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format((value ?? 0) / 100);
}

export function statusSeverity(status?: string | null): TagSeverity {
  switch (status) {
    case 'OK':
    case 'MATCHED':
    case 'RECONCILED':
    case 'LIQUIDATED':
    case 'WON':
    case 'REVERSED':
    case 'LOW':
      return 'success';
    case 'PENDING':
    case 'OPEN':
    case 'UNDER_REVIEW':
    case 'REPRESENTED':
    case 'PARTIALLY_RECONCILED':
    case 'PARTIALLY_LIQUIDATED':
    case 'PARTIALLY_COMPENSATED':
    case 'MEDIUM':
      return 'warn';
    case 'DIVERGENT':
    case 'NOT_RECONCILED':
    case 'MISSING_CONTRACT':
    case 'RATE_DIVERGENCE':
    case 'VALUE_DIVERGENCE':
    case 'MISSING_ACQUIRER_SALE':
    case 'MISSING_IN_ACQUIRER':
    case 'MISSING_IN_ERP':
    case 'DATE_DIVERGENCE':
    case 'INSTALLMENT_DIVERGENCE':
    case 'FLAG_DIVERGENCE':
    case 'MODALITY_DIVERGENCE':
    case 'DUPLICATED':
    case 'BANK_RELEASE_NOT_RECONCILED':
    case 'DEBIT_APPLIED':
    case 'CREDIT_APPLIED':
    case 'LOST':
    case 'EXPIRED':
    case 'HIGH':
    case 'CRITICAL':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function statusLabel(status?: string | null): string {
  const labels: Record<string, string> = {
    OK: 'OK',
    MATCHED: 'Conciliado',
    RECONCILED: 'Conciliado',
    PARTIALLY_RECONCILED: 'Parcial',
    DIVERGENT: 'Divergente',
    NOT_RECONCILED: 'Não conciliado',
    LIQUIDATED: 'Liquidado',
    PARTIALLY_LIQUIDATED: 'Parcialmente liquidado',
    PENDING: 'Pendente',
    OPEN: 'Aberto',
    UNDER_REVIEW: 'Em análise',
    REPRESENTED: 'Representado',
    WON: 'Ganho',
    LOST: 'Perdido',
    REVERSED: 'Revertido',
    EXPIRED: 'Expirado',
    MISSING_CONTRACT: 'Sem contrato',
    RATE_DIVERGENCE: 'Taxa divergente',
    VALUE_DIVERGENCE: 'Valor divergente',
    MISSING_ACQUIRER_SALE: 'Sem venda adquirente',
    MISSING_IN_ACQUIRER: 'Não localizado na adquirente',
    MISSING_IN_ERP: 'Não localizado no ERP',
    DATE_DIVERGENCE: 'Data divergente',
    INSTALLMENT_DIVERGENCE: 'Parcela divergente',
    FLAG_DIVERGENCE: 'Bandeira divergente',
    MODALITY_DIVERGENCE: 'Modalidade divergente',
    DUPLICATED: 'Duplicado',
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
    APPLIED: 'Aplicado',
    COMPENSATED: 'Compensado',
    PARTIALLY_COMPENSATED: 'Parcialmente compensado',
    BANK_RELEASE_NOT_RECONCILED: 'Banco não conciliado',
    DEBIT_APPLIED: 'Débito aplicado',
    CREDIT_APPLIED: 'Crédito aplicado',
    ERP_ACQUIRER: 'ERP x Adquirente',
    ACQUIRER_WITHOUT_ERP: 'Adquirente sem ERP',
    FEE_DIVERGENCE: 'Taxa divergente',
    BANK_SETTLEMENT: 'Liquidação bancária',
    COMMERCIAL_PENDING: 'Pendência comercial',
    DEBIT_PENDING: 'Débito pendente',
    CHARGEBACK_OPEN: 'Chargeback aberto',
    ACQUIRER_ADJUSTMENT: 'Ajuste da adquirente',
  };

  return status ? (labels[status] ?? status) : '-';
}

export function compactId(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
}
