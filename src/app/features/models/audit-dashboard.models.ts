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

export function mapAuditSaleRow(raw: any): AuditSaleRow {
  return {
    date: raw?.date ?? '',
    value: raw?.value ?? 0,
    cvCount: raw?.cvCount ?? 0,
  };
}

export function mapAuditSalesDetail(raw: any): AuditSalesDetail {
  return {
    acquirerName: raw?.acquirerName ?? '',
    rows: (raw?.rows ?? []).map(mapAuditSaleRow),
  };
}

export function mapAuditSalesSummaryModel(raw: any): AuditSalesSummaryModel {
  return {
    summary: (raw?.summary ?? []).map(mapAuditSaleRow),
    acquirerDetails: (raw?.acquirerDetails ?? []).map(mapAuditSalesDetail),
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

export function mapAuditUnreconciledDetail(raw: any): AuditUnreconciledDetail {
  return {
    date: raw?.date ?? '',
    erpAcq: raw?.ERP_ACQ ?? 0,
    onlyInErp: raw?.ONLY_IN_ERP ?? 0,
    onlyInAcquirer: raw?.ONLY_IN_ACQUIRER ?? 0,
  };
}

export function mapAuditUnreconciledAcquirer(raw: any): AuditUnreconciledAcquirer {
  return {
    acquirerId: raw?.acquirerId ?? 0,
    acquirer: raw?.acquirer ?? '',
    count: raw?.count ?? 0,
    details: (raw?.details ?? []).map(mapAuditUnreconciledDetail),
  };
}

export function mapAuditUnreconciledModel(raw: any): AuditUnreconciledModel {
  return {
    total: raw?.total ?? 0,
    acquirers: (raw?.acquirers ?? []).map(mapAuditUnreconciledAcquirer),
  };
}
