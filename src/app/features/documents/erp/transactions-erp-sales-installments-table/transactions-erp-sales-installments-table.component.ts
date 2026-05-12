import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';

import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { TransactionsErpModel } from '@models/transactions-erp.models';
import { TransactionsErpInstallmentModel } from '@models/transactions-erp-installment.models';

@Component({
  standalone: true,
  selector: 'app-transactions-erp-sales-installments-table',
  templateUrl: './transactions-erp-sales-installments-table.component.html',
  imports: [CommonModule, TableModule, TranslateModule, CsDatePipe, CsCurrencyPipe],
})
export class TransactionsErpSalesInstallmentsTableComponent {
  readonly transaction = input.required<TransactionsErpModel>();

  readonly installments = computed<TransactionsErpInstallmentModel[]>(() => {
    return [...(this.transaction().installments ?? [])].sort((a, b) => {
      return this.installmentNumber(a) - this.installmentNumber(b);
    });
  });

  protected installmentNumber(row: TransactionsErpInstallmentModel): number {
    return row.installmentNumber ?? row.installment ?? 0;
  }
}
