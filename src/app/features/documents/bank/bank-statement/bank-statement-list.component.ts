import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
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
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { BankStatementFacade } from '@features/facade/bank-statement.facade';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  BankStatementFiltersState,
  BankStatementAdvancedFilters,
  resetBankStatementAdvancedFilters,
  createEmptyBankStatementFiltersState,
} from '@features/filter/bank-statement.filters';
import {
  readArrayFilterValues,
  readPeriodFilterValue,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import { BankStatementModel } from '@models/bank-statement.model';
import {
  StatusPaymentBankEnum,
  allStatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-bank-statement-list',
  templateUrl: './bank-statement-list.component.html',
  imports: [
    CommonModule,
    MenuModule,
    SelectModule,
    TooltipModule,
    CsDatePipe,
    DatePickerModule,
    TableModule,
    MultiSelectModule,
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
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class BankStatementListComponent
  extends StatefulListPage<BankStatementFiltersState, BankStatementAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly router = inject(Router);
  readonly flagFacade = inject(FlagFacade);
  readonly bankFacade = inject(BankFacade);
  readonly facade = inject(BankStatementFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  readonly flagsOptions = this.flagFacade.options;
  readonly banksOptions = this.bankFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly items = computed<BankStatementModel[]>(() => this.facade.items());

  readonly isLaunchDateColumnDisabled = computed(() => !this.launchDateColumnPeriod());

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
  readonly periodLaunchDate = signal<PeriodEnum | null>(null);
  readonly launchDate = signal<string | string[] | null>(null);
  readonly statusPaymentBank = signal<StatusPaymentBankEnum[] | null>(null);

  readonly isLaunchDateDisabled = computed(() => !this.periodLaunchDate());

  /* Campos Tabela */
  readonly valueColumnDraft = signal('');
  readonly documentColumnDraft = signal('');
  readonly bankHistoryColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly bankColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);
  readonly launchDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly launchDateColumnDraft = signal<string | string[] | null>(null);
  readonly statusPaymentBankColumnDraft = signal<StatusPaymentBankEnum[] | null>(null);

  readonly statusPaymentBankOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusPaymentBankEnum().map((value) => ({
      label: statusPaymentBankEnumLabel(value, this.i18n),
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
    this.valueColumnDraft.set('');
    this.documentColumnDraft.set('');
    this.bankHistoryColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.bankColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.launchDateColumnDraft.set(null);
    this.launchDateColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);
    this.statusPaymentBankColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  statusPaymentBankLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.BANK_STATEMENT.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.BANK_STATEMENT.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.BANK_STATEMENT.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<BankStatementAdvancedFilters>>,
  ): void {
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<BankStatementAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetBankStatementAdvancedFilters(this);
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const flag = this.flags();
    const bank = this.banks();
    const company = this.companies();
    const acquirer = this.acquirers();
    const establishment = this.establishments();
    const statusPaymentBank = this.statusPaymentBank();

    const launchDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodLaunchDate(),
      this.launchDate(),
      this.i18n,
    );
    if (launchDateValue) {
      items.push({
        label: this.i18n.tUi('bankStatement.fields.launchDate'),
        value: launchDateValue,
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('bankStatement.fields.acquirer'), value: labels });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');
      items.push({ label: this.i18n.tUi('bankStatement.fields.flag'), value: labels });
    }

    if (bank?.length) {
      const labels = this.banksOptions()
        .filter((opt) => bank.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');
      items.push({ label: this.i18n.tUi('bankStatement.fields.bank'), value: labels });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('bankStatement.fields.company'), value: labels });
    }

    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');
      items.push({ label: this.i18n.tUi('bankStatement.fields.establishment'), value: labels });
    }

    if (statusPaymentBank?.length) {
      items.push({
        label: this.i18n.tUi('bankStatement.fields.statusPaymentBank'),
        value: statusPaymentBank.map((v) => statusPaymentBankEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  protected override buildAdvancedFilters(): Partial<BankStatementAdvancedFilters> {
    return {
      launchDate: this.launchDate() ?? undefined,
      periodLaunchDate: this.periodLaunchDate() ?? undefined,

      statusPaymentBank: this.statusPaymentBank()?.length ? this.statusPaymentBank()! : undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      banks: this.banks()?.length ? this.banks()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,
    };
  }

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

    this.syncArrayColumnDraftFromTableState(
      filters,
      'statusPaymentBank',
      this.statusPaymentBankColumnDraft,
      readArrayFilterValues,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'document',
      this.documentColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'bankHistory',
      this.bankHistoryColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'value',
      this.valueColumnDraft,
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
      'establishment',
      this.establishmentColumnDraft,
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

    this.syncArrayColumnDraftFromTableState(
      filters,
      'bank',
      this.bankColumnDraft,
      readArrayFilterValues,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'launchDate',
      this.launchDateColumnPeriod,
      this.launchDateColumnDraft,
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
        label: this.i18n.tUi('bankStatement.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const banks = readArrayFilterValues(filters, 'bank');
    if (banks.length) {
      const labels = this.banksOptions()
        .filter((option) => banks.includes(option.id))
        .map((option) => option.name);
      items.push({
        label: this.i18n.tUi('bankStatement.fields.bank'),
        value: (labels.length ? labels : banks).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);
      items.push({
        label: this.i18n.tUi('bankStatement.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);
      items.push({
        label: this.i18n.tUi('bankStatement.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);
      items.push({
        label: this.i18n.tUi('bankStatement.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    return items;
  }

  protected override toFiltersState(): BankStatementFiltersState {
    return {
      launchDate: this.launchDate(),
      periodLaunchDate: this.periodLaunchDate(),

      statusPaymentBank: this.statusPaymentBank(),

      banks: this.banks(),
      flags: this.flags(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),
    };
  }

  protected override applyFiltersState(s: BankStatementFiltersState): void {
    this.flags.set(s.flags ?? null);
    this.banks.set(s.banks ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.launchDate.set(s.launchDate ?? null);
    this.periodLaunchDate.set(s.periodLaunchDate ?? null);

    this.statusPaymentBank.set(s.statusPaymentBank ?? null);
  }

  protected bankingDomicileLabel(row: BankStatementModel): string {
    const agency = row.bankingDomicile?.agency ?? '-';
    const account = row.bankingDomicile?.currentAccount ?? '-';
    return `Ag. ${agency} Cc. ${account}`;
  }

  protected searchActions(row: BankStatementModel): MenuItem[] {
    return [
      {
        label: this.i18n.tUi('common.search.salesSummary'),
        icon: 'pi pi-search',
        command: () => this.searchOnSalesSummary(row),
      },
    ];
  }

  protected searchOnSalesSummary(row: BankStatementModel): void {
    const targetFilters = {
      ...createEmptyBankStatementFiltersState(),
      flags: row.flag?.id ? [row.flag.id] : null,
      companies: row.company?.id ? [row.company.id] : null,
      acquirers: row.acquirer?.id ? [row.acquirer.id] : null,
      establishments: row.establishment?.id ? [row.establishment.id] : null,
    };

    localStorage.setItem(
      STATE_KEY.CARDSYNC.SALES_SUMMARY.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.SALES_SUMMARY.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/sales-summary']);
  }

  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }
}
