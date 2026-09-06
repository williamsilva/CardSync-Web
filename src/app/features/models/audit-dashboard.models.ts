export interface AuditSaleRow {
  date: string;
  value: number;
  cvCount: number;
}

export interface AuditSalesDetail {
  acquirerName: string;
  rows: AuditSaleRow[];
}

export interface AuditSalesSummaryModel {
  summary: AuditSaleRow[];
  acquirerDetails: AuditSalesDetail[];
}

export function mapAuditSaleRow(raw: Record<string, unknown>): AuditSaleRow {
  return {
    date: (raw?.['date'] as string) ?? '',
    value: (raw?.['value'] as number) ?? 0,
    cvCount: (raw?.['cvCount'] as number) ?? 0,
  };
}

export function mapAuditSalesDetail(raw: Record<string, unknown>): AuditSalesDetail {
  return {
    acquirerName: (raw?.['acquirerName'] as string) ?? '',
    rows: ((raw?.['rows'] as Record<string, unknown>[]) ?? []).map(mapAuditSaleRow),
  };
}

export function mapAuditSalesSummaryModel(raw: Record<string, unknown>): AuditSalesSummaryModel {
  return {
    summary: ((raw?.['summary'] as Record<string, unknown>[]) ?? []).map(mapAuditSaleRow),
    acquirerDetails: ((raw?.['acquirerDetails'] as Record<string, unknown>[]) ?? []).map(
      mapAuditSalesDetail,
    ),
  };
}

// ─── Unreconciled ─────────────────────────────────────────────────────────────

export interface AuditUnreconciledDetail {
  date: string;
  erpAcq: number;
  onlyInErp: number;
  onlyInAcquirer: number;
}

export interface AuditUnreconciledAcquirer {
  acquirerId: number;
  acquirer: string;
  count: number;
  details: AuditUnreconciledDetail[];
}

export interface AuditUnreconciledModel {
  total: number;
  acquirers: AuditUnreconciledAcquirer[];
}

export function mapAuditUnreconciledDetail(raw: Record<string, unknown>): AuditUnreconciledDetail {
  return {
    date: (raw?.['date'] as string) ?? '',
    erpAcq: (raw?.['ERP_ACQ'] as number) ?? 0,
    onlyInErp: (raw?.['ONLY_IN_ERP'] as number) ?? 0,
    onlyInAcquirer: (raw?.['ONLY_IN_ACQUIRER'] as number) ?? 0,
  };
}

export function mapAuditUnreconciledAcquirer(
  raw: Record<string, unknown>,
): AuditUnreconciledAcquirer {
  return {
    acquirerId: (raw?.['acquirerId'] as number) ?? 0,
    acquirer: (raw?.['acquirer'] as string) ?? '',
    count: (raw?.['count'] as number) ?? 0,
    details: ((raw?.['details'] as Record<string, unknown>[]) ?? []).map(mapAuditUnreconciledDetail),
  };
}

export function mapAuditUnreconciledModel(raw: Record<string, unknown>): AuditUnreconciledModel {
  return {
    total: (raw?.['total'] as number) ?? 0,
    acquirers: ((raw?.['acquirers'] as Record<string, unknown>[]) ?? []).map(
      mapAuditUnreconciledAcquirer,
    ),
  };
}
