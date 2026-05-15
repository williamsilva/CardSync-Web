import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AfterViewInit, Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { readSingleFilterValue } from '@features/list-base/table-filter-readers';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { TransactionsAcqInstallmentModel } from '@models/transactions-acq-installment.models';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { TransactionsAcqInstallmentFacade } from '@features/facade/transaction-acq-installment.facade';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';
import {
  TransactionsAcqInstallmentFiltersState,
  TransactionsAcqInstallmentAdvancedFilters,
} from '@features/filter/transaction-acq-installment.filters';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-transactions-acq-installments-list',
  templateUrl: './transactions-acq-installments-list.component.html',
  imports: [
    CommonModule,
    CsDatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CsTagComponent,
    CsCurrencyPipe,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsAdvancedTextFilterComponent,
    CsCurrencyRangeFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
  ],
})
export class TransactionsAcquirersInstallmentsListComponent
  extends StatefulListPage<
    TransactionsAcqInstallmentFiltersState,
    TransactionsAcqInstallmentAdvancedFilters
  >
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  private readonly route = inject(ActivatedRoute);
  protected override readonly i18n = inject(I18nService);

  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);
  readonly installmentFacade = inject(TransactionsAcqInstallmentFacade);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly totalRecords = computed(() => this.installmentFacade.totalRecords());
  readonly installments = computed<TransactionsAcqInstallmentModel[]>(() =>
    this.installmentFacade.installments(),
  );

  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  readonly cvNsu = signal('');
  readonly status = signal('');
  readonly installment = signal('');
  readonly transactionId = signal('');
  readonly authorization = signal('');

  readonly flags = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);

  readonly netValueEnd = signal<number | null>(null);
  readonly feeValueEnd = signal<number | null>(null);
  readonly feeValueStart = signal<number | null>(null);
  readonly grossValueEnd = signal<number | null>(null);
  readonly netValueStart = signal<number | null>(null);
  readonly grossValueStart = signal<number | null>(null);
  readonly adjustmentValueEnd = signal<number | null>(null);
  readonly adjustmentValueStart = signal<number | null>(null);

  readonly periodSaleDate = signal<PeriodEnum | null>(null);
  readonly saleDate = signal<string | string[] | null>(null);
  readonly periodPaymentDate = signal<PeriodEnum | null>(null);
  readonly paymentDate = signal<string | string[] | null>(null);
  readonly periodConciliationDate = signal<PeriodEnum | null>(null);
  readonly conciliationDate = signal<string | string[] | null>(null);
  readonly periodExpectedPaymentDate = signal<PeriodEnum | null>(null);
  readonly expectedPaymentDate = signal<string | string[] | null>(null);

  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isPaymentDateDisabled = computed(() => !this.periodPaymentDate());
  readonly isConciliationDateDisabled = computed(() => !this.periodConciliationDate());
  readonly isExpectedPaymentDateDisabled = computed(() => !this.periodExpectedPaymentDate());

  readonly grossValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.grossValueStart(),
    end: this.grossValueEnd(),
  }));

  readonly feeValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.feeValueStart(),
    end: this.feeValueEnd(),
  }));

  readonly netValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.netValueStart(),
    end: this.netValueEnd(),
  }));

  readonly adjustmentValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.adjustmentValueStart(),
    end: this.adjustmentValueEnd(),
  }));

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  ngOnInit(): void {
    this.flagFacade.loadCompanyOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();

    const routeState = this.stateFromRouteQueryParams();
    if (routeState) {
      localStorage.setItem(this.filtersKey(), JSON.stringify(routeState));
      localStorage.removeItem(this.tableStateKey());
    }

    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.syncColumnDraftsFromTableState());
  }

  clear(): void {
    localStorage.removeItem(this.tableStateKey());
    sessionStorage.removeItem(this.tableStateKey());
    this.resetFilters();
    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  protected installmentNumber(row: TransactionsAcqInstallmentModel): string {
    const current = row.installmentNumber ?? row.installment ?? null;
    const total = row.installmentTotal ?? null;

    if (current == null) return '-';
    return total ? `${current}/${total}` : `${current}`;
  }

  protected rowStatus(row: TransactionsAcqInstallmentModel): string {
    return row.status ?? row.paymentStatus ?? row.statusPaymentBank ?? row.transactionStatus ?? '-';
  }

  protected statusTone(row: TransactionsAcqInstallmentModel): CsTagTone {
    const value = this.rowStatus(row).toUpperCase();

    if (value.includes('LIQUID') || value.includes('RECONCILED')) return 'success';
    if (value.includes('DIVERG')) return 'danger';
    if (value.includes('PARTIAL')) return 'warn';
    if (value.includes('PENDING')) return 'secondary';

    return 'info';
  }

  protected override tableStateKey(): string {
    return 'cardsync.acq.installments.table.state.v1';
  }

  protected override tableRowsKey(): string {
    return 'cardsync.acq.installments.table.rows';
  }

  protected override filtersKey(): string {
    return 'cardsync.acq.installments.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<TransactionsAcqInstallmentAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.installmentFacade.loadPage(query);
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<TransactionsAcqInstallmentAdvancedFilters>>,
  ): void {
    this.installmentFacade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.transactionId.set('');
    this.cvNsu.set('');
    this.authorization.set('');
    this.installment.set('');
    this.status.set('');

    this.flags.set(null);
    this.acquirers.set(null);
    this.companies.set(null);
    this.establishments.set(null);

    this.grossValueStart.set(null);
    this.grossValueEnd.set(null);
    this.feeValueStart.set(null);
    this.feeValueEnd.set(null);
    this.netValueStart.set(null);
    this.netValueEnd.set(null);
    this.adjustmentValueStart.set(null);
    this.adjustmentValueEnd.set(null);

    this.saleDate.set(null);
    this.periodSaleDate.set(null);
    this.paymentDate.set(null);
    this.periodPaymentDate.set(null);
    this.expectedPaymentDate.set(null);
    this.periodExpectedPaymentDate.set(null);
    this.conciliationDate.set(null);
    this.periodConciliationDate.set(null);
  }

  protected syncColumnDraftsFromTableState(): void {
    this.tableFiltersState.set(this.cloneTableFilters(this.dt?.filters));
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    this.pushTextTableFilter(items, filters, 'cvNsu', this.i18n.tUi('transactions.fields.cvNsu'));
    this.pushTextTableFilter(
      items,
      filters,
      'authorization',
      this.i18n.tUi('transactions.fields.authorization'),
    );
    this.pushTextTableFilter(
      items,
      filters,
      'installment',
      this.i18n.tUi('transactions.fields.installment'),
    );
    this.pushTextTableFilter(items, filters, 'status', this.i18n.tUi('transactions.fields.status'));
    this.pushTextTableFilter(
      items,
      filters,
      'company',
      this.i18n.tUi('transactions.fields.company'),
    );
    this.pushTextTableFilter(
      items,
      filters,
      'establishment',
      this.i18n.tUi('transactions.fields.establishment'),
    );
    this.pushTextTableFilter(
      items,
      filters,
      'acquirer',
      this.i18n.tUi('transactions.fields.acquirer'),
    );
    this.pushTextTableFilter(items, filters, 'flag', this.i18n.tUi('transactions.fields.flag'));
    this.pushMoneyTableFilter(
      items,
      filters,
      'grossValue',
      this.i18n.tUi('transactions.fields.grossValue'),
    );
    this.pushMoneyTableFilter(
      items,
      filters,
      'feeValue',
      this.i18n.tUi('transactions.fields.discountValue'),
    );
    this.pushMoneyTableFilter(
      items,
      filters,
      'netValue',
      this.i18n.tUi('transactions.fields.liquidValue'),
    );
    this.pushMoneyTableFilter(
      items,
      filters,
      'adjustmentValue',
      this.i18n.tUi('transactions.fields.adjustmentValue'),
    );

    return items;
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    /* this.pushAdvancedTextFilter(items, this.transactionId(), 'ID');
    this.pushAdvancedTextFilter(items, this.cvNsu(), this.i18n.tUi('transactions.fields.cvNsu'));
    this.pushAdvancedTextFilter(
      items,
      this.authorization(),
      this.i18n.tUi('transactions.fields.authorization'),
    );

    this.pushAdvancedTextFilter(
      items,
      this.installment(),
      this.i18n.tUi('transactions.fields.installment'),
    );

    this.pushAdvancedTextFilter(items, this.status(), this.i18n.tUi('transactions.fields.status'));

    this.pushAdvancedDateFilter(
      items,
      this.periodSaleDate(),
      this.saleDate(),
      this.i18n.tUi('transactions.fields.saleDate'),
    );
    this.pushAdvancedDateFilter(
      items,
      this.periodExpectedPaymentDate(),
      this.expectedPaymentDate(),
      this.i18n.tUi('transactions.fields.expectedPaymentDate'),
    );
    this.pushAdvancedDateFilter(
      items,
      this.periodPaymentDate(),
      this.paymentDate(),
      this.i18n.tUi('transactions.fields.paymentDate'),
    );
    this.pushAdvancedDateFilter(
      items,
      this.periodConciliationDate(),
      this.conciliationDate(),
      this.i18n.tUi('transactions.fields.conciliationDate'),
    );

    this.pushAdvancedCurrencyFilter(
      items,
      this.grossValueStart(),
      this.grossValueEnd(),
      this.i18n.tUi('transactions.fields.grossValue'),
    );
    this.pushAdvancedCurrencyFilter(
      items,
      this.feeValueStart(),
      this.feeValueEnd(),
      this.i18n.tUi('transactions.fields.discountValue'),
    );
    this.pushAdvancedCurrencyFilter(
      items,
      this.netValueStart(),
      this.netValueEnd(),
      this.i18n.tUi('transactions.fields.liquidValue'),
    );
    this.pushAdvancedCurrencyFilter(
      items,
      this.adjustmentValueStart(),
      this.adjustmentValueEnd(),
      this.i18n.tUi('transactions.fields.adjustmentValue'),
    );

    this.pushOptionsFilter(
      items,
      this.flags(),
      this.flagsOptions(),
      'id',
      'name',
      this.i18n.tUi('transactions.fields.flag'),
    );
    this.pushOptionsFilter(
      items,
      this.acquirers(),
      this.acquirersOptions(),
      'id',
      'fantasyName',
      this.i18n.tUi('transactions.fields.acquirer'),
    );
    this.pushOptionsFilter(
      items,
      this.companies(),
      this.companiesOptions(),
      'id',
      'fantasyName',
      this.i18n.tUi('transactions.fields.company'),
    );
    this.pushOptionsFilter(
      items,
      this.establishments(),
      this.establishmentsOptions(),
      'id',
      'pvNumber',
      this.i18n.tUi('transactions.fields.establishment'),
    ); */

    return items;
  });

  protected override toFiltersState(): TransactionsAcqInstallmentFiltersState {
    return {
      transactionId: this.transactionId(),
      cvNsu: this.cvNsu(),
      authorization: this.authorization(),
      installment: this.installment(),
      status: this.status(),

      grossValueStart: this.grossValueStart(),
      grossValueEnd: this.grossValueEnd(),
      feeValueStart: this.feeValueStart(),
      feeValueEnd: this.feeValueEnd(),
      netValueStart: this.netValueStart(),
      netValueEnd: this.netValueEnd(),
      adjustmentValueStart: this.adjustmentValueStart(),
      adjustmentValueEnd: this.adjustmentValueEnd(),

      flags: this.flags(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      saleDate: this.saleDate(),
      periodSaleDate: this.periodSaleDate(),
      paymentDate: this.paymentDate(),
      periodPaymentDate: this.periodPaymentDate(),
      expectedPaymentDate: this.expectedPaymentDate(),
      periodExpectedPaymentDate: this.periodExpectedPaymentDate(),
      conciliationDate: this.conciliationDate(),
      periodConciliationDate: this.periodConciliationDate(),
    };
  }

  protected override applyFiltersState(s: TransactionsAcqInstallmentFiltersState): void {
    this.transactionId.set(s.transactionId ?? '');
    this.cvNsu.set(s.cvNsu ?? '');
    this.authorization.set(s.authorization ?? '');
    this.installment.set(s.installment ?? '');
    this.status.set(s.status ?? '');

    this.grossValueStart.set(s.grossValueStart ?? null);
    this.grossValueEnd.set(s.grossValueEnd ?? null);
    this.feeValueStart.set(s.feeValueStart ?? null);
    this.feeValueEnd.set(s.feeValueEnd ?? null);
    this.netValueStart.set(s.netValueStart ?? null);
    this.netValueEnd.set(s.netValueEnd ?? null);
    this.adjustmentValueStart.set(s.adjustmentValueStart ?? null);
    this.adjustmentValueEnd.set(s.adjustmentValueEnd ?? null);

    this.flags.set(s.flags ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate ?? null);
    this.paymentDate.set(s.paymentDate ?? null);
    this.periodPaymentDate.set(s.periodPaymentDate ?? null);
    this.expectedPaymentDate.set(s.expectedPaymentDate ?? null);
    this.periodExpectedPaymentDate.set(s.periodExpectedPaymentDate ?? null);
    this.conciliationDate.set(s.conciliationDate ?? null);
    this.periodConciliationDate.set(s.periodConciliationDate ?? null);
  }

  protected override buildAdvancedFilters(): Partial<TransactionsAcqInstallmentAdvancedFilters> {
    return {
      transactionId: this.transactionId().trim() || undefined,
      cvNsu: this.cvNsu().trim() || undefined,
      authorization: this.authorization().trim() || undefined,
      installment: this.installment().trim() || undefined,
      status: this.status().trim() || undefined,

      grossValueStart: this.grossValueStart() ?? undefined,
      grossValueEnd: this.grossValueEnd() ?? undefined,
      feeValueStart: this.feeValueStart() ?? undefined,
      feeValueEnd: this.feeValueEnd() ?? undefined,
      netValueStart: this.netValueStart() ?? undefined,
      netValueEnd: this.netValueEnd() ?? undefined,
      adjustmentValueStart: this.adjustmentValueStart() ?? undefined,
      adjustmentValueEnd: this.adjustmentValueEnd() ?? undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      saleDate: this.saleDate() ?? undefined,
      periodSaleDate: this.periodSaleDate() ?? undefined,
      paymentDate: this.paymentDate() ?? undefined,
      periodPaymentDate: this.periodPaymentDate() ?? undefined,
      expectedPaymentDate: this.expectedPaymentDate() ?? undefined,
      periodExpectedPaymentDate: this.periodExpectedPaymentDate() ?? undefined,
      conciliationDate: this.conciliationDate() ?? undefined,
      periodConciliationDate: this.periodConciliationDate() ?? undefined,
    };
  }

  protected onGrossValueRangeChange(value: CsCurrencyRangeValue): void {
    this.grossValueStart.set(value.start ?? null);
    this.grossValueEnd.set(value.end ?? null);
  }

  protected onFeeValueRangeChange(value: CsCurrencyRangeValue): void {
    this.feeValueStart.set(value.start ?? null);
    this.feeValueEnd.set(value.end ?? null);
  }

  protected onNetValueRangeChange(value: CsCurrencyRangeValue): void {
    this.netValueStart.set(value.start ?? null);
    this.netValueEnd.set(value.end ?? null);
  }

  protected onAdjustmentValueRangeChange(value: CsCurrencyRangeValue): void {
    this.adjustmentValueStart.set(value.start ?? null);
    this.adjustmentValueEnd.set(value.end ?? null);
  }

  private stateFromRouteQueryParams(): TransactionsAcqInstallmentFiltersState | null {
    const params = this.route.snapshot.queryParamMap;
    const transactionId = params.get('transactionId') ?? '';
    const cvNsu = params.get('cvNsu') ?? '';
    const authorization = params.get('authorization') ?? '';
    const saleDate = params.get('saleDate') ?? '';

    if (!transactionId && !cvNsu && !authorization && !saleDate) {
      return null;
    }

    return {
      ...this.emptyFiltersState(),
      transactionId,
      cvNsu,
      authorization,
      periodSaleDate: saleDate ? PeriodEnum.DAY : null,
      saleDate: saleDate ? this.i18n.formatDateValue(saleDate) : null,
    };
  }

  private emptyFiltersState(): TransactionsAcqInstallmentFiltersState {
    return {
      transactionId: '',
      cvNsu: '',
      authorization: '',
      installment: '',
      status: '',
      grossValueStart: null,
      grossValueEnd: null,
      feeValueStart: null,
      feeValueEnd: null,
      netValueStart: null,
      netValueEnd: null,
      adjustmentValueStart: null,
      adjustmentValueEnd: null,
      flags: null,
      acquirers: null,
      companies: null,
      establishments: null,
      saleDate: null,
      periodSaleDate: null,
      paymentDate: null,
      periodPaymentDate: null,
      expectedPaymentDate: null,
      periodExpectedPaymentDate: null,
      conciliationDate: null,
      periodConciliationDate: null,
    };
  }

  private pushTextTableFilter(
    items: ActiveFilterItem[],
    filters: any,
    field: string,
    label: string,
  ): void {
    const value = readSingleFilterValue(filters, field);
    if (value) items.push({ label, value });
  }

  private pushMoneyTableFilter(
    items: ActiveFilterItem[],
    filters: any,
    field: string,
    label: string,
  ): void {
    const value = this.moneyFilterLabel(filters, field);
    if (value) items.push({ label, value });
  }

  private pushAdvancedTextFilter(items: ActiveFilterItem[], value: string, label: string): void {
    const normalized = value.trim();
    if (normalized) items.push({ label, value: normalized });
  }

  private pushAdvancedDateFilter(
    items: ActiveFilterItem[],
    period: PeriodEnum | null,
    date: string | string[] | null,
    label: string,
  ): void {
    const value = this.formatActiveFilterPeriodDateValue(period, date, this.i18n);
    if (value) items.push({ label, value });
  }

  private pushAdvancedCurrencyFilter(
    items: ActiveFilterItem[],
    start: number | null,
    end: number | null,
    label: string,
  ): void {
    const value = currencyRangeLabel(this.i18n, start, end);
    if (value) items.push({ label, value });
  }

  private pushOptionsFilter<T extends Record<string, unknown>>(
    items: ActiveFilterItem[],
    values: string[] | null,
    options: T[],
    valueKey: keyof T,
    labelKey: keyof T,
    label: string,
  ): void {
    if (!values?.length) return;

    const labels = options
      .filter((option) => values.includes(String(option[valueKey])))
      .map((option) => String(option[labelKey] ?? ''))
      .filter(Boolean);

    items.push({ label, value: (labels.length ? labels : values).join(', ') });
  }
}
