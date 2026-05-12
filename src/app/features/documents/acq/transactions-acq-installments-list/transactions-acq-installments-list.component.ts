import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, ViewChild } from '@angular/core';

import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ActiveFilterItem } from '@shared/features/filters-panel/filters-panel.component';
import { TransactionsErpInstallmentFiltersState } from '@models/transactions-erp-installment.models';
import { TransactionsErpInstallmentAdvancedFilters } from '@features/filter/transaction-erp-installment.filters';

@Component({
  standalone: true,
  selector: 'app-transactions-erp-installments-list',
  templateUrl: './transactions-acq-installments-list.component.html',
  imports: [CommonModule, ButtonModule, TranslateModule],
})
export class TransactionsAcquirersInstallmentsListComponent
  extends StatefulListPage<
    TransactionsErpInstallmentFiltersState,
    TransactionsErpInstallmentAdvancedFilters
  >
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;
  protected override readonly i18n = inject(I18nService);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  ngOnInit(): void {
    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.syncColumnDraftsFromTableState();
    });
  }

  clear(): void {
    const key = this.tableStateKey();
    console.log('Key ', key);

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  protected override tableStateKey(): string {
    return 'cardsync.erp.installments.table.state.v1';
  }

  protected override tableRowsKey(): string {
    return 'cardsync.erp.installments.table.rows';
  }

  protected override filtersKey(): string {
    return 'cardsync.erp.installments.filters.v1';
  }

  protected override loadFirstPage(): void {}

  protected override loadPage(
    query: ListQueryDto<TransactionsErpInstallmentAdvancedFilters>,
  ): void {}

  protected override resetFilters(): void {}

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;

    if (!filters) {
      return;
    }
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    return items;
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    return items;
  });

  protected override toFiltersState(): TransactionsErpInstallmentFiltersState {
    return {};
  }

  protected override applyFiltersState(s: TransactionsErpInstallmentFiltersState): void {}

  protected override buildAdvancedFilters(): Partial<TransactionsErpInstallmentAdvancedFilters> {
    return {};
  }
}
