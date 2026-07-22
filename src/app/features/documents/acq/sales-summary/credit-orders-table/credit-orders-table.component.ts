
import { Component, computed, inject, input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { SaleSummaryModel } from '@models/sales-summary.model';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CreditOrdersMinimalModel } from '@models/credit-orders-minimal.models';
import {
  StatusReconciliationEnum,
  statusReconciliationEnumLabel,
  statusReconciliationEnumSeverity,
} from '@models/enums/status-reconciliation.enum';
import {
  StatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';

@Component({
  standalone: true,
  selector: 'app-credit-orders-table',
  templateUrl: './credit-orders-table.component.html',
  imports: [
    CsDatePipe,
    TableModule,
    TooltipModule,
    CsCurrencyPipe,
    CsTagComponent,
    TranslateModule
],
})
export class CreditOrdersTableComponent {
  protected readonly i18n = inject(I18nService);

  readonly salesSummary = input.required<SaleSummaryModel>();

  readonly creditOrders = computed<CreditOrdersMinimalModel[]>(() => {
    return [...(this.salesSummary().creditOrders ?? [])].sort((a, b) => {
      return this.installmentNumber(a) - this.installmentNumber(b);
    });
  });

  protected installmentNumber(row: CreditOrdersMinimalModel): number {
    return row.installmentNumber ?? 0;
  }

  statusReconciliationLabel(value: StatusReconciliationEnum | null): string {
    return statusReconciliationEnumLabel(value, this.i18n);
  }

  statusReconciliationSeverity(value: StatusReconciliationEnum | null): CsTagTone {
    return statusReconciliationEnumSeverity(value);
  }

  statusPaymentBankLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }
}
