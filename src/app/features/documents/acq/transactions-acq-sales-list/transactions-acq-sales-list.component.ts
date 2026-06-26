import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { FlagFacade } from '@features/facade/flag.facade';
import { STATE_KEY } from '@features/state-key.constants';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { TransactionsAcqModel } from '@models/transactions-acq.models';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { TransactionsAcqFacade } from '@features/facade/transaction-acq.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { statusTransactionReasonEnumLabel } from '@models/enums/status-transaction-reason.enum';
import { createEmptyTransactionsErpFiltersState } from '@features/filter/transaction-erp.filters';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import { TransactionsAcquirersSalesInstallmentsTableComponent } from '../transactions-acq-sales-installments-table/transactions-acq-sales-installments-table.component';
import {
  StatusPaymentBankEnum,
  allStatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
} from '@models/enums/status-payment-bank.enum';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';
import {
  TransactionsAcqFiltersState,
  TransactionsAcqAdvancedFilters,
  resetTransactionsAcqAdvancedFilters,
  createEmptyTransactionsAcqFiltersState,
} from '@features/filter/transaction-acq.filters';
import {
  StatusTransactionEnum,
  allStatusTransactionEnum,
  statusTransactionEnumLabel,
  installmentStatusTooltipTone,
  installmentTooltipStatusLabel,
} from '@models/enums/status-transaction.enum';
import {
  CaptureEnum,
  allCaptureEnum,
  captureEnumLabel,
  captureEnumSeverity,
} from '@models/enums/capture.enum';
import {
  readArrayFilterValues,
  readPeriodFilterValue,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
  normalizeModalityEnum,
} from '@models/enums/modality.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  TransactionsAcqInstallmentFiltersState,
  createEmptyTransactionsAcqInstallmentFiltersState,
} from '@features/filter/transaction-acq-installment.filters';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-transactions-acquirers-sales-list',
  templateUrl: './transactions-acq-sales-list.component.html',
  imports: [
    CommonModule,
    FloatLabel,
    CsDatePipe,
    MenuModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CsTagComponent,
    CsDocumentPipe,
    CsCurrencyPipe,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsCurrencyRangeFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
    TransactionsAcquirersSalesInstallmentsTableComponent,
  ],
})
export class TransactionsAcquirersSalesListComponent
  extends StatefulListPage<TransactionsAcqFiltersState, TransactionsAcqAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly router = inject(Router);
  readonly flagFacade = inject(FlagFacade);
  readonly csDatePipe = inject(CsDatePipe);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly acqSalesFacade = inject(TransactionsAcqFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly totalRecords = computed(() => this.acqSalesFacade.totalRecords());
  readonly sales = computed<TransactionsAcqModel[]>(() => this.acqSalesFacade.sales());

  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  /* Campos Avançados*/
  readonly tid = signal('');
  readonly cvNsu = signal('');
  readonly machine = signal('');
  readonly rvNumber = signal('');
  readonly cardNumber = signal('');
  readonly authorization = signal('');

  readonly grossValueEnd = signal<number | null>(null);
  readonly liquidValueEnd = signal<number | null>(null);
  readonly grossValueStart = signal<number | null>(null);
  readonly discountValueEnd = signal<number | null>(null);
  readonly liquidValueStart = signal<number | null>(null);
  readonly discountValueStart = signal<number | null>(null);
  readonly adjustmentValueEnd = signal<number | null>(null);
  readonly adjustmentValueStart = signal<number | null>(null);

  readonly flags = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly capture = signal<CaptureEnum[] | null>(null);
  readonly establishments = signal<string[] | null>(null);
  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly periodSaleDate = signal<PeriodEnum | null>(null);
  readonly saleDate = signal<string | string[] | null>(null);
  readonly periodPaymentDate = signal<PeriodEnum | null>(null);
  readonly paymentDate = signal<string | string[] | null>(null);
  readonly periodConciliationDate = signal<PeriodEnum | null>(null);
  readonly conciliationDate = signal<string | string[] | null>(null);
  readonly periodExpectedPaymentDate = signal<PeriodEnum | null>(null);
  readonly expectedPaymentDate = signal<string | string[] | null>(null);
  readonly statusPaymentBank = signal<StatusPaymentBankEnum[] | null>(null);
  readonly statusTransaction = signal<StatusTransactionEnum[] | null>(null);

  /* Campos Tabela*/
  cvNsuColumnDraft = signal('');
  grossValueColumnDraft = signal('');
  liquidValueColumnDraft = signal('');
  installmentColumnDraft = signal('');
  authorizationColumnDraft = signal('');
  discountValueColumnDraft = signal('');
  adjustmentValueColumnDraft = signal('');

  flagColumnDraft = signal<string[] | null>(null);
  companyColumnDraft = signal<string[] | null>(null);
  captureColumnDraft = signal<string[] | null>(null);
  acquirerColumnDraft = signal<string[] | null>(null);
  modalityColumnDraft = signal<string[] | null>(null);
  saleDateColumnPeriod = signal<PeriodEnum | null>(null);
  establishmentColumnDraft = signal<string[] | null>(null);
  saleDateColumnDraft = signal<string | string[] | null>(null);
  expectedPaymentDateColumnPeriod = signal<PeriodEnum | null>(null);
  expectedPaymentDateColumnDraft = signal<string | string[] | null>(null);

  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isPaymentDateDisabled = computed(() => !this.periodPaymentDate());
  readonly isSaleDateColumnDisabled = computed(() => !this.saleDateColumnPeriod());
  readonly isConciliationDateDisabled = computed(() => !this.periodConciliationDate());
  readonly isExpectedPaymentDateDisabled = computed(() => !this.periodExpectedPaymentDate());

  readonly grossValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.grossValueStart(),
    end: this.grossValueEnd(),
  }));

  readonly adjustmentValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.adjustmentValueStart(),
    end: this.adjustmentValueEnd(),
  }));

  readonly discountValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.discountValueStart(),
    end: this.discountValueEnd(),
  }));

  readonly liquidValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.liquidValueStart(),
    end: this.liquidValueEnd(),
  }));

  readonly isExpectedPaymentDateColumnDisabled = computed(
    () => !this.expectedPaymentDateColumnPeriod(),
  );

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  readonly captureEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allCaptureEnum().map((value) => ({
      label: captureEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly statusTransactionOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusTransactionEnum().map((value) => ({
      label: statusTransactionEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly statusPaymentBankOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusPaymentBankEnum().map((value) => ({
      label: statusPaymentBankEnumLabel(value, this.i18n),
      value,
    }));
  });

  ngOnInit(): void {
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();
    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.syncColumnDraftsFromTableState();
    });
  }

  clear(): void {
    const key = this.tableStateKey();

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.acqSalesFacade.clearTotals();

    this.resetFilters();

    this.flagColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.captureColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.modalityColumnDraft.set(null);
    this.establishmentColumnDraft.set(null);

    this.cvNsuColumnDraft.set('');
    this.grossValueColumnDraft.set('');
    this.liquidValueColumnDraft.set('');
    this.installmentColumnDraft.set('');
    this.authorizationColumnDraft.set('');
    this.discountValueColumnDraft.set('');
    this.adjustmentValueColumnDraft.set('');

    this.saleDateColumnDraft.set(null);
    this.saleDateColumnPeriod.set(null);

    this.expectedPaymentDateColumnDraft.set(null);
    this.expectedPaymentDateColumnPeriod.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  calculateTotals(): void {
    this.acqSalesFacade.calculateTotals();
  }

  captureEnumLabel(value: CaptureEnum | null): string {
    return captureEnumLabel(value, this.i18n);
  }

  captureEnumSeverity(value: CaptureEnum | null): CsTagTone {
    return captureEnumSeverity(value);
  }

  modalityLabel(value: ModalityEnum | null): string {
    return modalityEnumLabel(value, this.i18n);
  }

  modalitySeverity(value: ModalityEnum | null): CsTagTone {
    return modalityEnumSeverity(value);
  }

  protected emptyFiltersState(): TransactionsAcqFiltersState {
    return createEmptyTransactionsAcqFiltersState();
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.ACQ.SALES.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.ACQ.SALES.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.ACQ.SALES.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<TransactionsAcqAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.acqSalesFacade.loadPage(query);
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<TransactionsAcqAdvancedFilters>>,
  ): void {
    this.acqSalesFacade.clearTotals();
    this.acqSalesFacade.loadPage(query);
  }

  protected override resetFilters(): void {
    resetTransactionsAcqAdvancedFilters(this);
  }

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;

    if (!filters) {
      return;
    }

    this.syncArrayColumnDraftFromTableState(
      filters,
      'flag',
      this.flagColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'capture',
      this.captureColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'modality',
      this.modalityColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'acquirer',
      this.acquirerColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'company',
      this.companyColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'establishment',
      this.establishmentColumnDraft,
      readArrayFilterValues,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'grossValue',
      this.grossValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'liquidValue',
      this.liquidValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'discountValue',
      this.discountValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'adjustmentValue',
      this.adjustmentValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'installment',
      this.installmentColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'cvNsu',
      this.cvNsuColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'authorization',
      this.authorizationColumnDraft,
      readSingleFilterValue,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'saleDate',
      this.saleDateColumnPeriod,
      this.saleDateColumnDraft,
      readPeriodFilterValue,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'expectedPaymentDate',
      this.expectedPaymentDateColumnPeriod,
      this.expectedPaymentDateColumnDraft,
      readPeriodFilterValue,
    );
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const captures = readArrayFilterValues(filters, 'capture');
    if (captures.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.capture'),
        value: captures
          .map((value) => captureEnumLabel(value as CaptureEnum, this.i18n))
          .join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.modality'),
        value: modalities
          .map((value) => modalityEnumLabel(value as ModalityEnum, this.i18n))
          .join(', '),
      });
    }

    const flags = readArrayFilterValues(filters, 'flag');
    if (flags.length) {
      const labels = this.flagsOptions()
        .filter((option) => flags.includes(option.id))
        .map((option) => option.name);

      items.push({
        label: this.i18n.tUi('transactions.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('transactions.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }
    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('transactions.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);

      items.push({
        label: this.i18n.tUi('transactions.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const saleDate = readPeriodFilterValue(filters, 'saleDate');
    if (saleDate?.period && saleDate.value) {
      items.push({
        label: this.i18n.tUi('transactions.fields.saleDate'),
        value: this.dateFilterLabel(saleDate),
      });
    }

    const expectedPaymentDate = readPeriodFilterValue(filters, 'expectedPaymentDate');
    if (expectedPaymentDate?.period && expectedPaymentDate.value) {
      items.push({
        label: this.i18n.tUi('transactions.fields.expectedPaymentDate'),
        value: this.dateFilterLabel(expectedPaymentDate),
      });
    }

    const grossValue = this.moneyFilterLabel(filters, 'grossValue');
    if (grossValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.grossValue'),
        value: grossValue,
      });
    }

    const adjustmentValue = this.moneyFilterLabel(filters, 'adjustmentValue');
    if (adjustmentValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.adjustmentValue'),
        value: adjustmentValue,
      });
    }

    const discountValue = this.moneyFilterLabel(filters, 'discountValue');
    if (discountValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.rate'),
        value: discountValue,
      });
    }

    const liquidValue = this.moneyFilterLabel(filters, 'liquidValue');
    if (liquidValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.liquid'),
        value: liquidValue,
      });
    }

    const installment = this.integerFilterLabel(filters, 'installment');
    if (installment) {
      items.push({
        label: this.i18n.tUi('transactions.fields.installments'),
        value: installment,
      });
    }

    const cvNsu = this.integerFilterLabel(filters, 'cvNsu');
    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('transactions.fields.cvNsu'),
        value: cvNsu,
      });
    }

    const authorization = this.integerFilterLabel(filters, 'authorization');
    if (authorization) {
      items.push({
        label: this.i18n.tUi('transactions.fields.authorization'),
        value: authorization,
      });
    }

    return items;
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const tid = this.tid();
    const flag = this.flags();
    const cvNsu = this.cvNsu();
    const machine = this.machine();
    const capture = this.capture();
    const company = this.companies();
    const modality = this.modality();
    const rvNumber = this.rvNumber();
    const acquirer = this.acquirers();
    const cardNumber = this.cardNumber();
    const authorization = this.authorization();
    const establishment = this.establishments();
    const statusPaymentBank = this.statusPaymentBank();
    const statusTransaction = this.statusTransaction();

    const discountValueEnd = this.discountValueEnd();
    const liquidValueEnd = this.liquidValueEnd();
    const grossValueEnd = this.grossValueEnd();
    const discountValueStart = this.discountValueStart();
    const liquidValueStart = this.liquidValueStart();
    const grossValueStart = this.grossValueStart();
    const adjustmentValueEnd = this.adjustmentValueEnd();
    const adjustmentValueStart = this.adjustmentValueStart();

    const saleDate = this.saleDate();
    const periodSaleDate = this.periodSaleDate();

    const paymentDate = this.paymentDate();
    const periodPaymentDate = this.periodPaymentDate();

    const expectedPaymentDate = this.expectedPaymentDate();
    const periodExpectedPaymentDate = this.periodExpectedPaymentDate();

    const saleDateValue = this.formatActiveFilterPeriodDateValue(
      periodSaleDate,
      saleDate,
      this.i18n,
    );
    if (saleDateValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.saleDate'),
        value: saleDateValue,
      });
    }

    const paymentDateValue = this.formatActiveFilterPeriodDateValue(
      periodPaymentDate,
      paymentDate,
      this.i18n,
    );
    if (paymentDateValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.paymentDate'),
        value: paymentDateValue,
      });
    }

    const expectedPaymentDateValue = this.formatActiveFilterPeriodDateValue(
      periodExpectedPaymentDate,
      expectedPaymentDate,
      this.i18n,
    );
    if (expectedPaymentDateValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.expectedPaymentDate'),
        value: expectedPaymentDateValue,
      });
    }

    const discountValueLabel = currencyRangeLabel(this.i18n, discountValueStart, discountValueEnd);
    if (discountValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.discountValue'),
        value: discountValueLabel,
      });
    }

    const adjustmentValueLabel = currencyRangeLabel(
      this.i18n,
      adjustmentValueStart,
      adjustmentValueEnd,
    );
    if (adjustmentValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.adjustmentValue'),
        value: adjustmentValueLabel,
      });
    }

    const liquidValueLabel = currencyRangeLabel(this.i18n, liquidValueStart, liquidValueEnd);
    if (liquidValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.liquidValue'),
        value: liquidValueLabel,
      });
    }

    const grossValueLabel = currencyRangeLabel(this.i18n, grossValueStart, grossValueEnd);
    if (grossValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.grossValue'),
        value: grossValueLabel,
      });
    }

    if (machine) {
      items.push({
        label: this.i18n.tUi('transactions.fields.machine'),
        value: machine,
      });
    }

    if (cardNumber) {
      items.push({
        label: this.i18n.tUi('transactions.fields.cardNumber'),
        value: cardNumber,
      });
    }

    if (rvNumber) {
      items.push({
        label: this.i18n.tUi('transactions.fields.rvNumber'),
        value: rvNumber,
      });
    }

    if (authorization) {
      items.push({
        label: this.i18n.tUi('transactions.fields.authorization'),
        value: authorization,
      });
    }

    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('transactions.fields.cvNsu'),
        value: cvNsu,
      });
    }

    if (tid) {
      items.push({
        label: this.i18n.tUi('transactions.fields.tid'),
        value: tid,
      });
    }

    if (capture?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.capture'),
        value: capture.map((v) => captureEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (statusTransaction?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.statusTransaction'),
        value: statusTransaction.map((v) => statusTransactionEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (statusPaymentBank?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.statusPaymentBank'),
        value: statusPaymentBank.map((v) => statusPaymentBankEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.acquirer'),
        value: labels,
      });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.flag'),
        value: labels,
      });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.company'),
        value: labels,
      });
    }

    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.establishment'),
        value: labels,
      });
    }

    return items;
  });

  protected override toFiltersState(): TransactionsAcqFiltersState {
    return {
      tid: this.tid(),
      cvNsu: this.cvNsu(),
      machine: this.machine(),
      capture: this.capture(),
      rvNumber: this.rvNumber(),
      cardNumber: this.cardNumber(),
      authorization: this.authorization(),
      statusPaymentBank: this.statusPaymentBank(),
      statusTransaction: this.statusTransaction(),

      liquidValueEnd: this.liquidValueEnd(),
      grossValueEnd: this.grossValueEnd(),
      liquidValueStart: this.liquidValueStart(),
      grossValueStart: this.grossValueStart(),
      discountValueEnd: this.discountValueEnd(),
      discountValueStart: this.discountValueStart(),
      adjustmentValueEnd: this.adjustmentValueEnd(),
      adjustmentValueStart: this.adjustmentValueStart(),

      flags: this.flags(),
      modality: this.modality(),
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

  protected override applyFiltersState(s: TransactionsAcqFiltersState): void {
    this.tid.set(s.tid ?? '');
    this.cvNsu.set(s.cvNsu ?? '');
    this.machine.set(s.machine ?? '');
    this.rvNumber.set(s.rvNumber ?? '');
    this.cardNumber.set(s.cardNumber ?? '');
    this.authorization.set(s.authorization ?? '');
    this.statusPaymentBank.set(s.statusPaymentBank ?? null);
    this.statusTransaction.set(s.statusTransaction ?? null);

    this.grossValueEnd.set(s.grossValueEnd ?? null);
    this.liquidValueEnd.set(s.liquidValueEnd ?? null);
    this.grossValueStart.set(s.grossValueStart ?? null);
    this.discountValueEnd.set(s.discountValueEnd ?? null);
    this.liquidValueStart.set(s.liquidValueStart ?? null);
    this.discountValueStart.set(s.discountValueStart ?? null);
    this.adjustmentValueEnd.set(s.adjustmentValueEnd ?? null);
    this.adjustmentValueStart.set(s.adjustmentValueStart ?? null);

    this.flags.set(s.flags ?? null);
    this.capture.set(s.capture ?? null);
    this.modality.set(s.modality ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate);

    this.paymentDate.set(s.paymentDate ?? null);
    this.periodPaymentDate.set(s.periodPaymentDate);

    this.expectedPaymentDate.set(s.expectedPaymentDate ?? null);
    this.periodExpectedPaymentDate.set(s.periodExpectedPaymentDate);

    this.conciliationDate.set(s.conciliationDate ?? null);
    this.periodConciliationDate.set(s.periodConciliationDate ?? null);
  }

  protected override buildAdvancedFilters(): Partial<TransactionsAcqAdvancedFilters> {
    const discountValueEnd = this.discountValueEnd();
    const liquidValueEnd = this.liquidValueEnd();
    const grossValueEnd = this.grossValueEnd();
    const discountValueStart = this.discountValueStart();
    const liquidValueStart = this.liquidValueStart();
    const grossValueStart = this.grossValueStart();
    const adjustmentValueEnd = this.adjustmentValueEnd();
    const adjustmentValueStart = this.adjustmentValueStart();

    return {
      tid: this.tid().trim() || undefined,
      cvNsu: this.cvNsu().trim() || undefined,
      machine: this.machine().trim() || undefined,
      rvNumber: this.rvNumber() || undefined,
      cardNumber: this.cardNumber().trim() || undefined,
      authorization: this.authorization().trim() || undefined,

      discountValueEnd: discountValueEnd ?? undefined,
      liquidValueEnd: liquidValueEnd ?? undefined,
      grossValueEnd: grossValueEnd ?? undefined,
      discountValueStart: discountValueStart ?? undefined,
      liquidValueStart: liquidValueStart ?? undefined,
      grossValueStart: grossValueStart ?? undefined,
      adjustmentValueEnd: adjustmentValueEnd ?? undefined,
      adjustmentValueStart: adjustmentValueStart ?? undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      capture: this.capture()?.length ? this.capture()! : undefined,
      modality: this.modality()?.length ? this.modality()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,
      statusPaymentBank: this.statusPaymentBank()?.length ? this.statusPaymentBank()! : undefined,
      statusTransaction: this.statusTransaction()?.length ? this.statusTransaction()! : undefined,

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

  protected onAdjustmentValueRangeChange(value: CsCurrencyRangeValue): void {
    this.adjustmentValueStart.set(value.start ?? null);
    this.adjustmentValueEnd.set(value.end ?? null);
  }

  protected onLiquidValueRangeChange(value: CsCurrencyRangeValue): void {
    this.liquidValueStart.set(value.start ?? null);
    this.liquidValueEnd.set(value.end ?? null);
  }

  protected onDiscountValueRangeChange(value: CsCurrencyRangeValue): void {
    this.discountValueStart.set(value.start ?? null);
    this.discountValueEnd.set(value.end ?? null);
  }

  /* Metodos Tooltip Tabela */
  protected hasCvNsu(row: any): boolean {
    return row?.cvNsu !== null && row?.cvNsu !== undefined && row?.cvNsu !== '';
  }

  protected discountTooltip(row: any): string {
    const flexRate = 0;
    const rate = row?.contractedFee ?? null;

    return this.infoTooltip([
      {
        label: `${this.i18n.tUi('transactions.tooltip.mdrRate')}:`,
        value: rate != null && rate !== '' ? `${rate}%` : this.i18n.tUi('common.notInformedFemale'),
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.tooltip.flexRate')}:`,
        value: this.i18n.formatBrlCurrency(flexRate),
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.grossValue')}:`,
        value: this.i18n.formatBrlCurrency(row?.grossValue),
      },
      {
        label: `${this.i18n.tUi('transactions.fields.discountValue')}:`,
        value: this.i18n.formatBrlCurrency(row?.discountValue),
      },
      {
        label: `${this.i18n.tUi('transactions.fields.liquidValue')}:`,
        value: this.i18n.formatBrlCurrency(row?.liquidValue),
      },
    ]);
  }

  protected cvNsuTooltip(row: any): string {
    const tid = row?.tid || this.i18n.tUi('common.notInformed');
    const cardName = row?.cardName || this.i18n.tUi('common.notInformed');
    const issuer = row?.cardIssuerName || this.i18n.tUi('common.notInformed');
    const cardNumber = row?.cardNumber || this.i18n.tUi('common.notInformed');

    return this.infoTooltip([
      {
        label: `${this.i18n.tUi('transactions.fields.tid')}:`,
        value: tid,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.cardNumber')}:`,
        value: cardNumber,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.cardName')}:`,
        value: cardName,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.issuer')}:`,
        value: issuer,
      },
    ]);
  }

  protected infoTooltip(rows: Array<{ label: string; value: string; nowrap?: boolean }>): string {
    const content = rows
      .filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
      .map((row) => this.infoTooltipRow(row.label, row.value, row.nowrap))
      .join('');

    return `<div class="cs-tooltip">${content}</div>`;
  }

  protected infoTooltipRow(label: string, value: string, nowrap = false): string {
    const nowrapClass = nowrap ? ' cs-tooltip-row-nowrap' : '';

    return `
    <div class="cs-tooltip-row${nowrapClass}">
      <span class="cs-tooltip-label">${label}</span>
      <span class="cs-tooltip-value">${value}</span>
    </div>
  `;
  }

  /* Metodos Tooltip Status */
  protected installmentStatusTooltip(row: any): string {
    const status = installmentTooltipStatusLabel(row?.statusTransaction, this.i18n);
    const reason = statusTransactionReasonEnumLabel(row?.statusTransactionReason, this.i18n);

    const conciliationDate = row?.saleReconciliationDate
      ? this.csDatePipe.transform(row.saleReconciliationDate, 'short')
      : '-';

    const agency = row?.salesSummary?.bankingDomicile?.agency ?? '-';
    const bank = row?.salesSummary?.bankingDomicile?.bank?.name ?? '-';
    const account = row?.salesSummary?.bankingDomicile?.currentAccount ?? '-';

    return this.infoTooltip([
      {
        label: `${this.i18n.tUi('transactions.fields.status')}:`,
        value: status,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.conciliationDate')}:`,
        value: conciliationDate,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.reason')}:`,
        value: reason,
      },
      {
        label: '',
        value: '',
      },
      {
        label: `${this.i18n.tUi('transactions.fields.bankDomicile')}`,
        value: '',
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.bank')}:`,
        value: bank,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.agency')}:`,
        value: agency,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.account')}:`,
        value: account,
        nowrap: true,
      },
    ]);
  }

  protected installmentStatusTooltipClass(row: any): string {
    const tone = installmentStatusTooltipTone(row?.statusTransaction);

    return `cs-info-tooltip cs-installment-tooltip cs-installment-tooltip-${tone}`;
  }

  protected saleStatusIcon(row: any): string {
    const tone = installmentStatusTooltipTone(row?.statusTransaction);

    if (tone === 'success') {
      return 'pi pi-thumbs-up cs-sale-status-icon cs-sale-status-icon-success';
    }

    if (tone === 'warn') {
      return 'pi pi-times cs-sale-status-icon cs-sale-status-icon-warning';
    }

    return 'pi pi-thumbs-down cs-sale-status-icon cs-sale-status-icon-danger';
  }

  /* Metodos busca */
  protected searchActions(row: TransactionsAcqModel): MenuItem[] {
    return [
      {
        label: `${this.i18n.tUi('transactions.search.process')}: ${row.processedFile?.file}
            (${this.i18n.tUi('transactions.search.line')}: ${row.lineNumber})`,
        icon: 'pi pi-eye',
        command: () => this.searchOnFileSales(row),
      },
      {
        label: this.i18n.tUi('transactions.search.Installments'),
        icon: 'pi pi-list',
        command: () => this.openAcqInstallments(row),
      },
      {
        label: this.i18n.tUi('transactions.search.searchErp'),
        icon: 'pi pi-search',
        command: () => this.searchOnErpSales(row),
      },
    ];
  }

  protected searchOnFileSales(row: TransactionsAcqModel): void {
    const targetFilters = this.buildTargetFileFilters(row);

    localStorage.setItem(
      STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.TABLE.STATE.V1);

    this.openRouteInNewTab(['/file-processing/files']);
  }

  protected openAcqInstallments(row: TransactionsAcqModel): void {
    const targetFilters = this.buildInstallmentsTargetFilters(row);

    localStorage.setItem(
      STATE_KEY.CARDSYNC.ACQ.INSTALLMENT.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.ACQ.INSTALLMENT.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/installments']);
  }

  protected searchOnErpSales(row: TransactionsAcqModel): void {
    const targetFilters = this.buildTargetErpFilters(row);

    localStorage.setItem(STATE_KEY.CARDSYNC.ERP.SALES.FILTERS.V1, JSON.stringify(targetFilters));
    localStorage.removeItem(STATE_KEY.CARDSYNC.ERP.SALES.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/erp/sales']);
  }

  protected buildTargetFileFilters(row: TransactionsAcqModel): TransactionsAcqFiltersState {
    return {
      ...this.emptyFiltersState(),
    };
  }

  protected buildTargetErpFilters(row: TransactionsAcqModel): TransactionsAcqFiltersState {
    const modality = normalizeModalityEnum(row.modality);
    return {
      ...createEmptyTransactionsErpFiltersState(),
      rvNumber: row.rvNumber ?? '',
      authorization: row.authorization ?? '',
      cvNsu: row.cvNsu != null ? String(row.cvNsu) : '',

      flags: row.flag?.id ? [row.flag.id] : null,
      companies: row.company?.id ? [row.company.id] : null,
      acquirers: row.acquirer?.id ? [row.acquirer.id] : null,
      establishments: row.establishment?.id ? [row.establishment.id] : null,

      modality: modality && modality !== ModalityEnum.NULL ? [modality] : null,
      periodSaleDate: row.saleDate ? PeriodEnum.DAY : null,
      saleDate: row.saleDate ? this.i18n.formatDateValue(row.saleDate) : null,
    };
  }

  protected buildInstallmentsTargetFilters(
    row: TransactionsAcqModel,
  ): TransactionsAcqInstallmentFiltersState {
    const modality = normalizeModalityEnum(row.modality);
    return {
      ...createEmptyTransactionsAcqInstallmentFiltersState(),
      authorization: row.authorization ?? '',
      cvNsu: row.cvNsu != null ? String(row.cvNsu) : '',

      flags: row.flag?.id ? [row.flag.id] : null,
      companies: row.company?.id ? [row.company.id] : null,
      acquirers: row.acquirer?.id ? [row.acquirer.id] : null,
      establishments: row.establishment?.id ? [row.establishment.id] : null,

      modality: modality && modality !== ModalityEnum.NULL ? [modality] : null,
      periodSaleDate: row.saleDate ? PeriodEnum.DAY : null,
      saleDate: row.saleDate ? this.i18n.formatDateValue(row.saleDate) : null,
    };
  }

  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }
}
