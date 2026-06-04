import { CommonModule } from '@angular/common';
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
} from '@models/enums/adjustment-reason.enum';

@Component({
  standalone: true,
  selector: 'app-adjustments-table',
  templateUrl: './adjustments-table.component.html',
  imports: [
    CommonModule,
    CsDatePipe,
    TableModule,
    TooltipModule,
    CsCurrencyPipe,
    CsTagComponent,
    TranslateModule,
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

  adjustmentReasonSeverity(value: AdjustmentReasonEnum | null): CsTagTone {
    return adjustmentReasonEnumSeverity(value);
  }
}
