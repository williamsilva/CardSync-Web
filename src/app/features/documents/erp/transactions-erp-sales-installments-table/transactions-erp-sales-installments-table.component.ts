import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { TransactionsErpModel } from '@models/transactions-erp.models';
import { TransactionsErpInstallmentModel } from '@models/transactions-erp-installment.models';
import {
  StatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';

@Component({
  standalone: true,
  selector: 'app-transactions-erp-sales-installments-table',
  templateUrl: './transactions-erp-sales-installments-table.component.html',
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
export class TransactionsErpSalesInstallmentsTableComponent {
  protected readonly i18n = inject(I18nService);

  readonly transaction = input.required<TransactionsErpModel>();

  readonly installments = computed<TransactionsErpInstallmentModel[]>(() => {
    return [...(this.transaction().installments ?? [])].sort((a, b) => {
      return this.installmentNumber(a) - this.installmentNumber(b);
    });
  });

  protected installmentNumber(row: TransactionsErpInstallmentModel): number {
    return row.installmentNumber ?? row.installment ?? 0;
  }

  statusPaymentBankLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }
}
