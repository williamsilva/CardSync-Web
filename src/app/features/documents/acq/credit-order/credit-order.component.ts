import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelect } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagTone, CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { FlagFacade } from '@features/facade/flag.facade';
import { BankFacade } from '@features/facade/bank.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { CreditOrderFacade } from '@features/facade/credit-order.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';
import {
  readArrayFilterValues,
  readPeriodFilterValue,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  StatusPaymentBankEnum,
  allStatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  StatusReconciliationEnum,
  allStatusReconciliationEnum,
  statusReconciliationEnumLabel,
  statusReconciliationEnumSeverity,
} from '@models/enums/status-reconciliation.enum';
import {
  CreditOrderFiltersState,
  CreditOrderAdvancedFilters,
  resetCreditOrderAdvancedFilters,
} from '@features/filter/credit-order.filters';
import {
  CreditOrderModel,
  createEmptyCreditOrderAdvancedFilters,
} from '@models/credit-order.model';
import {
  SaleSummaryAdvancedFilters,
  createEmptySaleSummaryFiltersState,
} from '@features/filter/sale-summary.filters';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-credit-order-list',
  templateUrl: './credit-order.component.html',
  imports: [
    CommonModule,
    Menu,
    Select,
    Tooltip,
    CsDatePipe,
    FloatLabel,
    DatePicker,
    TableModule,
    MultiSelect,
    FormsModule,
    ButtonModule,
    CsCurrencyPipe,
    CsDocumentPipe,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsCurrencyRangeFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class CreditOrderListComponent
  extends StatefulListPage<CreditOrderFiltersState, CreditOrderAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly facade = inject(CreditOrderFacade);

  readonly router = inject(Router);
  readonly flagFacade = inject(FlagFacade);
  readonly bankFacade = inject(BankFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  readonly flagsOptions = this.flagFacade.options;
  readonly banksOptions = this.bankFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly sales = computed<CreditOrderModel[]>(() => this.facade.sales());

  readonly isRvDateColumnDisabled = computed(() => !this.rvDateColumnPeriod());

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({
      label: periodEnumLabel(value, this.i18n),
      value,
    }));
  });

  /* Campos Filtros avançados */
  readonly flags = signal<string[] | null>(null);
  readonly banks = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);

  readonly periodRvDate = signal<PeriodEnum | null>(null);
  readonly rvDate = signal<string | string[] | null>(null);

  readonly periodReleaseDate = signal<PeriodEnum | null>(null);
  readonly releaseDate = signal<string | string[] | null>(null);

  readonly periodCreditOrderDate = signal<PeriodEnum | null>(null);
  readonly creditOrderDate = signal<string | string[] | null>(null);

  readonly rvNumber = signal<string>('');

  readonly modality = signal<ModalityEnum[] | null>(null);

  readonly grossValueEnd = signal<number | null>(null);
  readonly grossValueStart = signal<number | null>(null);

  readonly discountValueEnd = signal<number | null>(null);
  readonly discountValueStart = signal<number | null>(null);

  readonly releaseValueEnd = signal<number | null>(null);
  readonly releaseValueStart = signal<number | null>(null);

  readonly statusPaymentBank = signal<StatusPaymentBankEnum[] | null>(null);
  readonly salesSummaryStatus = signal<StatusReconciliationEnum[] | null>(null);

  readonly isRvDateDisabled = computed(() => !this.periodRvDate());
  readonly isReleaseDateDisabled = computed(() => !this.periodReleaseDate());
  readonly isCreditOrderDateDisabled = computed(() => !this.periodCreditOrderDate());

  readonly grossValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.grossValueStart(),
    end: this.grossValueEnd(),
  }));

  readonly discountValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.discountValueStart(),
    end: this.discountValueEnd(),
  }));

  readonly releaseValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.releaseValueStart(),
    end: this.releaseValueEnd(),
  }));

  /* Campos Tabela */
  readonly rvNumberColumnDraft = signal('');
  readonly pvNumberColumnDraft = signal('');
  readonly grossValueColumnDraft = signal('');
  readonly releaseValueColumnDraft = signal('');
  readonly discountValueColumnDraft = signal('');
  readonly installmentNumberColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly rvDateColumnDraft = signal<string | string[] | null>(null);
  readonly releaseDateColumnDraft = signal<string | string[] | null>(null);
  readonly creditOrderDateColumnDraft = signal<string | string[] | null>(null);

  readonly rvDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly modalityColumnDraft = signal<ModalityEnum[] | null>(null);
  readonly releaseDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly creditOrderDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly statusPaymentBankColumnDraft = signal<StatusPaymentBankEnum[] | null>(null);
  readonly salesSummaryStatusColumnDraft = signal<StatusReconciliationEnum[] | null>(null);

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
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

  readonly statusReconciliationOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusReconciliationEnum().map((value) => ({
      label: statusReconciliationEnumLabel(value, this.i18n),
      value,
    }));
  });

  ngOnInit(): void {
    this.bankFacade.loadBankOptionsFilter();
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

    this.resetFilters();
    this.rvNumberColumnDraft.set('');
    this.pvNumberColumnDraft.set('');
    this.grossValueColumnDraft.set('');
    this.releaseValueColumnDraft.set('');
    this.discountValueColumnDraft.set('');
    this.installmentNumberColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.rvDateColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.rvDateColumnPeriod.set(null);
    this.modalityColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.releaseDateColumnDraft.set(null);
    this.releaseDateColumnPeriod.set(null);
    this.creditOrderDateColumnDraft.set(null);
    this.creditOrderDateColumnPeriod.set(null);
    this.statusPaymentBankColumnDraft.set(null);
    this.salesSummaryStatusColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  statusReconciliationLabel(value: StatusReconciliationEnum | null): string {
    return statusReconciliationEnumLabel(value, this.i18n);
  }

  statusReconciliationSeverity(value: StatusReconciliationEnum | null): CsTagTone {
    return statusReconciliationEnumSeverity(value);
  }

  statusPaymentBankEnumLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }

  modalityLabel(value: ModalityEnum | null): string {
    return modalityEnumLabel(value, this.i18n);
  }

  modalitySeverity(value: ModalityEnum | null): CsTagTone {
    return modalityEnumSeverity(value);
  }

  protected emptyFiltersState(): CreditOrderAdvancedFilters {
    return createEmptyCreditOrderAdvancedFilters();
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.CREDIT_ORDER.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.CREDIT_ORDER.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.CREDIT_ORDER.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<CreditOrderAdvancedFilters>>,
  ): void {
    this.facade.clearTotals();
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<CreditOrderAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetCreditOrderAdvancedFilters(this);
  }

  /* Filtros Avançados */
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const flag = this.flags();
    const bank = this.banks();
    const company = this.companies();
    const acquirer = this.acquirers();
    const modality = this.modality();
    const rvNumber = this.rvNumber();
    const statusPaymentBank = this.statusPaymentBank();
    const salesSummaryStatus = this.salesSummaryStatus();

    const grossValueLabel = currencyRangeLabel(
      this.i18n,
      this.grossValueStart(),
      this.grossValueEnd(),
    );
    const discountValueLabel = currencyRangeLabel(
      this.i18n,
      this.discountValueStart(),
      this.discountValueEnd(),
    );
    const releaseValueLabel = currencyRangeLabel(
      this.i18n,
      this.releaseValueStart(),
      this.releaseValueEnd(),
    );

    const rvDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodRvDate(),
      this.rvDate(),
      this.i18n,
    );
    if (rvDateValue) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.rvDate'),
        value: rvDateValue,
      });
    }

    const creditOrderDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodCreditOrderDate(),
      this.creditOrderDate(),
      this.i18n,
    );
    if (creditOrderDateValue) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.creditOrderDate'),
        value: creditOrderDateValue,
      });
    }

    const releaseDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodReleaseDate(),
      this.releaseDate(),
      this.i18n,
    );
    if (releaseDateValue) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.releaseDate'),
        value: releaseDateValue,
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('creditOrders.fields.acquirer'),
        value: labels,
      });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('creditOrders.fields.flag'),
        value: labels,
      });
    }

    if (bank?.length) {
      const labels = this.banksOptions()
        .filter((opt) => bank.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('creditOrders.fields.bankingDomicile'),
        value: labels,
      });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('creditOrders.fields.company'),
        value: labels,
      });
    }

    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (rvNumber) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.rvNumber'),
        value: rvNumber,
      });
    }

    if (grossValueLabel) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.grossValue'),
        value: grossValueLabel,
      });
    }

    if (discountValueLabel) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.discountValue'),
        value: discountValueLabel,
      });
    }

    if (releaseValueLabel) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.releaseValue'),
        value: releaseValueLabel,
      });
    }

    if (salesSummaryStatus?.length) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.salesSummaryStatus'),
        value: salesSummaryStatus
          .map((v) => statusReconciliationEnumLabel(v, this.i18n))
          .join(', '),
      });
    }

    if (statusPaymentBank?.length) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.statusPaymentBank'),
        value: statusPaymentBank.map((v) => statusPaymentBankEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const establishment = this.establishments();
    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.pvNumber))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('saleSummary.fields.establishment'),
        value: labels,
      });
    }

    return items;
  });

  protected override buildAdvancedFilters(): Partial<CreditOrderAdvancedFilters> {
    return {
      flags: this.flags()?.length ? this.flags()! : undefined,
      banks: this.banks()?.length ? this.banks()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      rvDate: this.rvDate() ?? undefined,
      periodRvDate: this.periodRvDate() ?? undefined,

      releaseDate: this.releaseDate() ?? undefined,
      periodReleaseDate: this.periodReleaseDate() ?? undefined,

      creditOrderDate: this.creditOrderDate() ?? undefined,
      periodCreditOrderDate: this.periodCreditOrderDate() ?? undefined,

      rvNumber: this.rvNumber() || undefined,

      modality: this.modality()?.length ? this.modality()! : undefined,

      grossValueEnd: this.grossValueEnd() ?? undefined,
      grossValueStart: this.grossValueStart() ?? undefined,

      discountValueEnd: this.discountValueEnd() ?? undefined,
      discountValueStart: this.discountValueStart() ?? undefined,

      releaseValueEnd: this.releaseValueEnd() ?? undefined,
      releaseValueStart: this.releaseValueStart() ?? undefined,

      salesSummaryStatus: this.salesSummaryStatus()?.length
        ? this.salesSummaryStatus()!
        : undefined,
      statusPaymentBank: this.statusPaymentBank()?.length ? this.statusPaymentBank()! : undefined,
    };
  }

  /* End Filtros Avançados */
  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

    this.syncTextColumnDraftFromTableState(
      filters,
      'rvNumber',
      this.rvNumberColumnDraft,
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
      'releaseValue',
      this.releaseValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'grossValue',
      this.grossValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'modality',
      this.modalityColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'statusPaymentBank',
      this.statusPaymentBankColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'salesSummaryStatus',
      this.salesSummaryStatusColumnDraft,
      readArrayFilterValues,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'pvNumber',
      this.pvNumberColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'installmentNumber',
      this.installmentNumberColumnDraft,
      readSingleFilterValue,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'company',
      this.companyColumnDraft,
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
      'flag',
      this.flagColumnDraft,
      readArrayFilterValues,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'rvDate',
      this.rvDateColumnPeriod,
      this.rvDateColumnDraft,
      readPeriodFilterValue,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'creditOrderDate',
      this.creditOrderDateColumnPeriod,
      this.creditOrderDateColumnDraft,
      readPeriodFilterValue,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'releaseDate',
      this.releaseDateColumnPeriod,
      this.releaseDateColumnDraft,
      readPeriodFilterValue,
    );
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const flags = readArrayFilterValues(filters, 'flag');
    if (flags.length) {
      const labels = this.flagsOptions()
        .filter((option) => flags.includes(option.id))
        .map((option) => option.name);

      items.push({
        label: this.i18n.tUi('creditOrders.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('creditOrders.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('creditOrders.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.modality'),
        value: modalities.map((v) => modalityEnumLabel(v as ModalityEnum, this.i18n)).join(', '),
      });
    }

    const salesSummaryStatuses = readArrayFilterValues(filters, 'salesSummaryStatus');
    if (salesSummaryStatuses.length) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.salesSummaryStatus'),
        value: salesSummaryStatuses
          .map((v) => statusReconciliationEnumLabel(v as StatusReconciliationEnum, this.i18n))
          .join(', '),
      });
    }

    const statusPaymentBanks = readArrayFilterValues(filters, 'statusPaymentBank');
    if (statusPaymentBanks.length) {
      items.push({
        label: this.i18n.tUi('creditOrders.fields.statusPaymentBank'),
        value: statusPaymentBanks
          .map((v) => statusPaymentBankEnumLabel(v as StatusPaymentBankEnum, this.i18n))
          .join(', '),
      });
    }

    return items;
  }

  protected override toFiltersState(): CreditOrderFiltersState {
    return {
      flags: this.flags(),
      banks: this.banks(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      rvDate: this.rvDate(),
      periodRvDate: this.periodRvDate(),

      releaseDate: this.releaseDate(),
      periodReleaseDate: this.periodReleaseDate(),

      creditOrderDate: this.creditOrderDate(),
      periodCreditOrderDate: this.periodCreditOrderDate(),

      rvNumber: this.rvNumber(),
      modality: this.modality(),

      grossValueStart: this.grossValueStart(),
      grossValueEnd: this.grossValueEnd(),
      discountValueStart: this.discountValueStart(),
      discountValueEnd: this.discountValueEnd(),
      releaseValueStart: this.releaseValueStart(),
      releaseValueEnd: this.releaseValueEnd(),

      salesSummaryStatus: this.salesSummaryStatus(),
      statusPaymentBank: this.statusPaymentBank(),
    };
  }

  protected override applyFiltersState(s: CreditOrderAdvancedFilters): void {
    this.flags.set(s.flags ?? null);
    this.banks.set(s.banks ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.rvDate.set(s.rvDate ?? null);
    this.periodRvDate.set(s.periodRvDate ?? null);

    this.releaseDate.set(s.releaseDate ?? null);
    this.periodReleaseDate.set(s.periodReleaseDate ?? null);

    this.creditOrderDate.set(s.creditOrderDate ?? null);
    this.periodCreditOrderDate.set(s.periodCreditOrderDate ?? null);

    this.rvNumber.set(s.rvNumber ?? '');
    this.modality.set(s.modality ?? null);

    this.grossValueStart.set(s.grossValueStart ?? null);
    this.grossValueEnd.set(s.grossValueEnd ?? null);
    this.discountValueStart.set(s.discountValueStart ?? null);
    this.discountValueEnd.set(s.discountValueEnd ?? null);
    this.releaseValueStart.set(s.releaseValueStart ?? null);
    this.releaseValueEnd.set(s.releaseValueEnd ?? null);

    this.salesSummaryStatus.set(s.salesSummaryStatus ?? null);
    this.statusPaymentBank.set(s.statusPaymentBank ?? null);
  }

  protected onGrossValueRangeChange(value: CsCurrencyRangeValue): void {
    this.grossValueStart.set(value.start ?? null);
    this.grossValueEnd.set(value.end ?? null);
  }

  protected onDiscountValueRangeChange(value: CsCurrencyRangeValue): void {
    this.discountValueStart.set(value.start ?? null);
    this.discountValueEnd.set(value.end ?? null);
  }

  protected onLiquidValueRangeChange(value: CsCurrencyRangeValue): void {
    this.releaseValueStart.set(value.start ?? null);
    this.releaseValueEnd.set(value.end ?? null);
  }

  /* Metodos busca */
  protected searchActions(row: CreditOrderModel): MenuItem[] {
    return [
      {
        label: `${this.i18n.tUi('common.search.process')}: ${row.processedFile?.file}
            (${this.i18n.tUi('common.search.line')}: ${row.salesSummary?.lineNumber})`,
        icon: 'pi pi-eye',
        command: () => this.searchOnFileSales(row),
      },
      {
        label: this.i18n.tUi('common.search.salesSummary'),
        icon: 'pi pi-search',
        command: () => this.searchOnSalesSummary(row),
      },
    ];
  }

  protected searchOnFileSales(row: CreditOrderModel): void {
    const targetFilters = this.buildTargetFileFilters(row);

    localStorage.setItem(
      STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.TABLE.STATE.V1);

    this.openRouteInNewTab(['/file-processing/files']);
  }

  protected buildTargetFileFilters(_row: CreditOrderModel): CreditOrderAdvancedFilters {
    return {
      ...this.emptyFiltersState(),
    };
  }

  protected searchOnSalesSummary(row: CreditOrderModel): void {
    const targetFilters = this.buildTargetSalesSummary(row);

    localStorage.setItem(
      STATE_KEY.CARDSYNC.SALES_SUMMARY.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.SALES_SUMMARY.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/sales-summary']);
  }

  protected buildTargetSalesSummary(row: CreditOrderModel): SaleSummaryAdvancedFilters {
    return {
      ...createEmptySaleSummaryFiltersState(),
      rvDate: row.salesSummary?.rvNumber ? String(row.salesSummary.rvNumber) : undefined,

      rvNumber: row.rvNumber ? row.rvNumber : undefined,

      flags: row.flag?.id ? [row.flag.id] : null,
      companies: row.company?.id ? [row.company.id] : null,
      acquirers: row.acquirer?.id ? [row.acquirer.id] : null,
      establishments: row.establishment?.id ? [row.establishment.id] : null,
    };
  }

  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }

  protected bankingDomicileLabel(row: CreditOrderModel): string {
    const agency = row.bankingDomicile?.agency;
    const account = row.bankingDomicile?.currentAccount;

    if (!agency || !account) {
      return '-';
    }

    return `Ag. ${agency} Cc. ${account}`;
  }
}
