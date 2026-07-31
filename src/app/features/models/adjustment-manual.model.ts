export interface AdjustmentManualCreateInput {
  pvNumber: number;
  acquirerId: string;
  companyId?: string | null;
  pvNumberOriginal?: number | null;
  rvNumberOriginal: number;
  adjustmentDate: string;
  creditDate?: string | null;
  adjustmentValue: number;
  transactionValue?: number | null;
  totalDebitValue?: number | null;
  pendingValue?: number | null;
  debitType?: string | null;
  adjustmentType?: string | null;
  adjustmentDescription?: string | null;
  flagName?: string | null;
  rawAdjustmentCode?: string | null;
}

export interface AdjustmentManualResultModel {
  id: string;
  rvNumberOriginal?: number | null;
  adjustmentValue?: number | null;
  creditDate?: string | null;
}
