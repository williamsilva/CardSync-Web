import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { TransactionsAcqModel } from '@models/transactions-acq.models';
import { TransactionsAcqInstallmentModel } from '@models/transactions-acq-installment.models';
import {
  StatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';

@Component({
  standalone: true,
  selector: 'app-transactions-acquires-sales-installments-table',
  templateUrl: './transactions-acq-sales-installments-table.component.html',
  imports: [CommonModule, TableModule, TranslateModule, CsDatePipe, CsCurrencyPipe, CsTagComponent],
})
export class TransactionsAcquirersSalesInstallmentsTableComponent {
  protected readonly i18n = inject(I18nService);

  readonly transaction = input.required<TransactionsAcqModel>();

  readonly installments = computed<TransactionsAcqInstallmentModel[]>(() => {
    return [...(this.transaction().installments ?? [])].sort((a, b) => {
      return this.installmentNumber(a) - this.installmentNumber(b);
    });
  });

  protected installmentNumber(row: TransactionsAcqInstallmentModel): number {
    return row.installmentNumber ?? row.installment ?? 0;
  }

  statusPaymentBankLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }
}
