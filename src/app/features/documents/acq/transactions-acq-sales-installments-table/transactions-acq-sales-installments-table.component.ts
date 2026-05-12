import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';

import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { TransactionsAcqModel } from '@models/transactions-acq.models';
import { TransactionsAcqInstallmentModel } from '@models/transactions-acq-installment.models';

@Component({
  standalone: true,
  selector: 'app-transactions-acquires-sales-installments-table',
  templateUrl: './transactions-acq-sales-installments-table.component.html',
  imports: [CommonModule, TableModule, TranslateModule, CsDatePipe, CsCurrencyPipe],
})
export class TransactionsAcquirersSalesInstallmentsTableComponent {
  readonly transaction = input.required<TransactionsAcqModel>();

  readonly installments = computed<TransactionsAcqInstallmentModel[]>(() => {
    return [...(this.transaction().installments ?? [])].sort((a, b) => {
      return this.installmentNumber(a) - this.installmentNumber(b);
    });
  });

  protected installmentNumber(row: TransactionsAcqInstallmentModel): number {
    return row.installmentNumber ?? row.installment ?? 0;
  }
}
