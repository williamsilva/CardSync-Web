export type ManagementGroupBy = 'COMPANY' | 'ACQUIRER' | 'MODALITY' | 'FLAG' | 'DATE';

export interface ManagementDashboardGroupBy {
  sales: ManagementGroupBy;
  payments: ManagementGroupBy;
  fees: ManagementGroupBy;
  debits: ManagementGroupBy;
}

export interface ManagementDashboardFilters {
  companyIds: string[];
  acquirerIds: string[];
  flagIds: string[];
  modalities: string[];
  periodSaleDate: string | null;
  saleDate: string | string[] | null;
  groupBy: ManagementDashboardGroupBy;
}

export interface ManagementTableRow {
  label: string;
  transactions: number;
  value: number;
  discount: number;
  liquid: number;
  percentage: number;
}

export interface ManagementChartSection {
  labels: string[];
  primarySeries: number[];
  secondarySeries: number[];
  rows: ManagementTableRow[];
}

export interface ManagementFeesRow {
  label: string;
  transactions: number;
  effectiveRate: number;
  discount: number;
  percentage: number;
}

export interface ManagementFeesSection {
  labels: string[];
  effectiveRateSeries: number[];
  averageRateSeries: number[];
  rows: ManagementFeesRow[];
}

export interface ManagementDebitSummary {
  total: number;
  quantity: number;
  average: number;
}

export interface ManagementDebitsSection {
  labels: string[];
  cancellationSeries: number[];
  feesSeries: number[];
  chargebackSeries: number[];
  fees: ManagementDebitSummary;
  chargeback: ManagementDebitSummary;
  cancellation: ManagementDebitSummary;
}

export interface ManagementDashboardModel {
  sales: ManagementChartSection;
  payments: ManagementChartSection;
  fees: ManagementFeesSection;
  debits: ManagementDebitsSection;
}
