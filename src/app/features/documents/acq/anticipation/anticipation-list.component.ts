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
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { AnticipationFacade } from '@features/facade/anticipation.facade';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  AnticipationFiltersState,
  AnticipationAdvancedFilters,
  resetAnticipationAdvancedFilters,
  createEmptyAnticipationFiltersState,
} from '@features/filter/anticipation.filters';
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
  AnticipationModel,
  createEmptyAnticipationAdvancedFilters,
} from '@models/anticipation.model';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  StatusTransactionEnum,
  allStatusTransactionEnum,
  statusTransactionEnumLabel,
  statusTransactionEnumSeverity,
} from '@models/enums/status-transaction.enum';
import {
  StatusPaymentBankEnum,
  allStatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-anticipation-list',
  templateUrl: './anticipation-list.component.html',
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
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class AnticipationListComponent
  extends StatefulListPage<AnticipationFiltersState, AnticipationAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly facade = inject(AnticipationFacade);

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
  readonly sales = computed<AnticipationModel[]>(() => this.facade.sales());

  readonly isReleaseDateColumnDisabled = computed(() => !this.releaseDateColumnPeriod());
  readonly isOriginalDueDateColumnDisabled = computed(() => !this.originalDueDateColumnPeriod());

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
  readonly rvNumber = signal<number | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);
  readonly releaseDate = signal<string | string[] | null>(null);

  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly periodReleaseDate = signal<PeriodEnum | null>(null);
  readonly statusPaymentBank = signal<StatusPaymentBankEnum[] | null>(null);
  readonly transactionsStatus = signal<StatusTransactionEnum[] | null>(null);

  readonly isReleaseDateDisabled = computed(() => !this.periodReleaseDate());

  /* Campos Tabela */
  readonly grossValueColumnDraft = signal('');
  readonly numberCvNsuColumnDraft = signal('');
  readonly releaseValueColumnDraft = signal('');
  readonly discountRateValueColumnDraft = signal('');
  readonly installmentNumberColumnDraft = signal('');
  readonly originalCreditValueColumnDraft = signal('');
  readonly advanceDiscountValueColumnDraft = signal('');
  readonly numberRvCorrespondingColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly bankColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);
  readonly releaseDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly originalDueDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly releaseDateColumnDraft = signal<string | string[] | null>(null);
  readonly originalDueDateColumnDraft = signal<string | string[] | null>(null);
  readonly statusPaymentBankColumnDraft = signal<StatusPaymentBankEnum[] | null>(null);
  readonly transactionsStatusColumnDraft = signal<StatusTransactionEnum[] | null>(null);

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly transactionsStatusOptions = computed(() => {
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
    this.grossValueColumnDraft.set('');
    this.numberCvNsuColumnDraft.set('');
    this.releaseValueColumnDraft.set('');
    this.installmentNumberColumnDraft.set('');
    this.discountRateValueColumnDraft.set('');
    this.originalCreditValueColumnDraft.set('');
    this.advanceDiscountValueColumnDraft.set('');
    this.numberRvCorrespondingColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.bankColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.releaseDateColumnDraft.set(null);
    this.releaseDateColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);
    this.originalDueDateColumnDraft.set(null);
    this.originalDueDateColumnPeriod.set(null);
    this.statusPaymentBankColumnDraft.set(null);
    this.transactionsStatusColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  statusTransactionLabel(value: StatusTransactionEnum | null): string {
    return statusTransactionEnumLabel(value, this.i18n);
  }

  statusTransactionSeverity(value: StatusTransactionEnum | null): CsTagTone {
    return statusTransactionEnumSeverity(value);
  }

  statusPaymentBankEnumLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.ANTICIPATION.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.ANTICIPATION.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.ANTICIPATION.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<AnticipationAdvancedFilters>>,
  ): void {
    this.facade.clearTotals();
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<AnticipationAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetAnticipationAdvancedFilters(this);
  }

  /* Filtros Avançados*/
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const flag = this.flags();
    const bank = this.banks();
    const company = this.companies();
    const acquirer = this.acquirers();
    const establishment = this.establishments();
    const modality = this.modality();
    const transactionsStatus = this.transactionsStatus();
    const statusPaymentBank = this.statusPaymentBank();

    const releaseDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodReleaseDate(),
      this.releaseDate(),
      this.i18n,
    );
    if (releaseDateValue) {
      items.push({
        label: this.i18n.tUi('anticipation.fields.releaseDate'),
        value: releaseDateValue,
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('anticipation.fields.acquirer'),
        value: labels,
      });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('anticipation.fields.flag'),
        value: labels,
      });
    }

    if (bank?.length) {
      const labels = this.banksOptions()
        .filter((opt) => bank.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('anticipation.fields.bank'),
        value: labels,
      });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('anticipation.fields.company'),
        value: labels,
      });
    }

    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('anticipation.fields.establishment'),
        value: labels,
      });
    }

    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('anticipation.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (transactionsStatus?.length) {
      items.push({
        label: this.i18n.tUi('anticipation.fields.transactionsStatusEnum'),
        value: transactionsStatus.map((v) => statusTransactionEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (statusPaymentBank?.length) {
      items.push({
        label: this.i18n.tUi('anticipation.fields.statusPaymentBankEnum'),
        value: statusPaymentBank.map((v) => statusPaymentBankEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  protected override buildAdvancedFilters(): Partial<AnticipationAdvancedFilters> {
    return {
      rvNumber: this.rvNumber() ?? undefined,

      releaseDate: this.releaseDate() ?? undefined,
      periodReleaseDate: this.periodReleaseDate() ?? undefined,

      modality: this.modality()?.length ? this.modality()! : undefined,
      transactionsStatus: this.transactionsStatus()?.length
        ? this.transactionsStatus()!
        : undefined,
      statusPaymentBank: this.statusPaymentBank()?.length ? this.statusPaymentBank()! : undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      banks: this.banks()?.length ? this.banks()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,
    };
  }

  /*End Filtros Avançados */
  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

    this.syncArrayColumnDraftFromTableState(
      filters,
      'statusPaymentBank',
      this.statusPaymentBankColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'transactionsStatus',
      this.transactionsStatusColumnDraft,
      readArrayFilterValues,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'numberRvCorresponding',
      this.numberRvCorrespondingColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'numberCvNsu',
      this.numberCvNsuColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'grossValue',
      this.grossValueColumnDraft,
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
      'originalCreditValue',
      this.originalCreditValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'discountRateValue',
      this.discountRateValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'advanceDiscountValue',
      this.advanceDiscountValueColumnDraft,
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
      'bak',
      this.bankColumnDraft,
      readArrayFilterValues,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'originalDueDate',
      this.originalDueDateColumnPeriod,
      this.originalDueDateColumnDraft,
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
        label: this.i18n.tUi('anticipation.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const banks = readArrayFilterValues(filters, 'bank');
    if (banks.length) {
      const labels = this.banksOptions()
        .filter((option) => banks.includes(option.id))
        .map((option) => option.name);

      items.push({
        label: this.i18n.tUi('anticipation.fields.flag'),
        value: (labels.length ? labels : banks).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('anticipation.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('anticipation.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);

      items.push({
        label: this.i18n.tUi('anticipation.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    return items;
  }

  protected override toFiltersState(): AnticipationFiltersState {
    return {
      rvNumber: this.rvNumber(),

      periodReleaseDate: this.periodReleaseDate(),
      releaseDate: this.releaseDate(),

      modality: this.modality(),
      transactionsStatus: this.transactionsStatus(),
      statusPaymentBank: this.statusPaymentBank(),

      banks: this.banks(),
      flags: this.flags(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),
    };
  }

  protected override applyFiltersState(s: AnticipationFiltersState): void {
    this.flags.set(s.flags ?? null);
    this.banks.set(s.banks ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.releaseDate.set(s.releaseDate ?? null);
    this.periodReleaseDate.set(s.periodReleaseDate ?? null);

    this.modality.set(s.modality ?? null);
    this.transactionsStatus.set(s.transactionsStatus ?? null);
    this.statusPaymentBank.set(s.statusPaymentBank ?? null);
  }

  protected bankingDomicileTooltip(row: any): string {
    const agency = row.bankingDomicile?.agency ?? '-';
    const account = row.bankingDomicile?.currentAccount ?? '-';

    return `Ag. ${agency} Cc. ${account}`;
  }

  /* Metodos busca */
  protected searchActions(row: AnticipationModel): MenuItem[] {
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

  protected searchOnFileSales(row: AnticipationModel): void {
    const targetFilters = this.buildTargetFileFilters(row);

    localStorage.setItem(STATE_KEY.CARDSYNC.FILE.FILTERS.V1, JSON.stringify(targetFilters));
    localStorage.removeItem(STATE_KEY.CARDSYNC.FILE.TABLE.STATE.V1);

    this.openRouteInNewTab(['/file-processing/files']);
  }

  protected buildTargetFileFilters(row: AnticipationModel): AnticipationAdvancedFilters {
    return {
      ...createEmptyAnticipationAdvancedFilters,
    };
  }

  protected searchOnSalesSummary(row: AnticipationModel): void {
    const targetFilters = this.buildTargetSalesSummary(row);

    localStorage.setItem(
      STATE_KEY.CARDSYNC.SALES_SUMMARY.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.SALES_SUMMARY.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/sales-summary']);
  }

  protected buildTargetSalesSummary(row: AnticipationModel): AnticipationAdvancedFilters {
    return {
      ...createEmptyAnticipationFiltersState(),

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
}
