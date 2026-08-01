
import { Component, computed, inject, input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { SaleSummaryModel } from '@models/sales-summary.model';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { AdjustmentsMinimalModel } from '@models/adjustments-minimal.models';
import {
  AdjustmentReasonEnum,
  adjustmentReasonEnumLabel,
  adjustmentReasonEnumSeverity,
  normalizeAdjustmentReasonEnum,
} from '@models/enums/adjustment-reason.enum';

@Component({
  standalone: true,
  selector: 'app-adjustments-table',
  templateUrl: './adjustments-table.component.html',
  imports: [
    CsDatePipe,
    TableModule,
    TooltipModule,
    CsCurrencyPipe,
    CsTagComponent,
    TranslateModule
],
})
export class AdjustmentTableComponent {
  protected readonly i18n = inject(I18nService);

  readonly salesSummary = input.required<SaleSummaryModel>();

  readonly adjustments = computed<AdjustmentsMinimalModel[]>(() => {
    return [...(this.salesSummary().adjustments ?? [])].sort((a, b) => {
      return this.installmentNumber(a) - this.installmentNumber(b);
    });
  });

  protected installmentNumber(row: AdjustmentsMinimalModel): number {
    return row.installmentNumber ?? 0;
  }

  adjustmentReasonLabel(value: AdjustmentReasonEnum | null): string {
    return adjustmentReasonEnumLabel(value, this.i18n);
  }

  /**
   * Ajustes criados manualmente (tela de Ajuste) não têm adjustmentReason (código do arquivo
   * automático da adquirente) — só o motivo em texto livre digitado/importado. Sem esse fallback,
   * a coluna sempre mostrava "N/A" pra esses ajustes, mesmo com o motivo real preenchido
   * (confirmado com dados reais: RV 82730892, "aluguel de maquininha").
   */
  adjustmentMotivoLabel(row: AdjustmentsMinimalModel): string {
    const normalized = normalizeAdjustmentReasonEnum(row.adjustmentReason);
    if (normalized && normalized !== AdjustmentReasonEnum.NULL) {
      return adjustmentReasonEnumLabel(row.adjustmentReason, this.i18n);
    }
    return row.adjustmentDescription?.trim() || adjustmentReasonEnumLabel(row.adjustmentReason, this.i18n);
  }

  adjustmentReasonSeverity(value: AdjustmentReasonEnum | null): CsTagTone {
    return adjustmentReasonEnumSeverity(value);
  }
}
