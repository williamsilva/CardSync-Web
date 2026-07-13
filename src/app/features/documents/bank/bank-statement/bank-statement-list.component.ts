import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

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
import { BankStatementModel } from '@models/bank-statement.model';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { BankStatementFacade } from '@features/facade/bank-statement.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { createEmptyCreditOrderFiltersState } from '@features/filter/credit-order.filters';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { ManualBankReconciliationApiService } from '@features/service/manual-bank-reconciliation.api.service';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  BankStatementFiltersState,
  BankStatementAdvancedFilters,
  resetBankStatementAdvancedFilters,
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
import {
  StatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
  allStatusPaymentBankStatementEnum,
} from '@models/enums/status-payment-bank.enum';
import {
  ModalityPaymentBankEnum,
  modalityPaymentBankLabel,
  allModalityPaymentBankEnum,
  modalityPaymentBankSeverity,
} from '@models/enums/modality-payment-bank.enum';
import {
  ReleaseCategoryEnum,
  releaseCategoryLabel,
  allReleaseCategoryEnum,
  releaseCategorySeverity,
} from '@models/enums/release-category.enum';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-bank-statement-list',
  templateUrl: './bank-statement-list.component.html',
  imports: [
    CommonModule,
    CsDatePipe,
    MenuModule,
    FormsModule,
    TableModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    CsCurrencyPipe,
    CsDocumentPipe,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsCurrencyRangeFilterComponent,
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

  readonly router = inject(Router);
  protected override readonly i18n = inject(I18nService);
  private readonly confirm = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly manualBankReconciliationApi = inject(ManualBankReconciliationApiService);

  /** Exposto para o template (habilitar/mostrar ações condicionadas ao status). */
  protected readonly StatusPaymentBankEnum = StatusPaymentBankEnum;

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

  readonly isReleaseDateColumnDisabled = computed(() => !this.releaseDateColumnPeriod());

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
  readonly periodReleaseDate = signal<PeriodEnum | null>(null);
  readonly releaseDate = signal<string | string[] | null>(null);
  readonly releaseCategory = signal<ReleaseCategoryEnum[] | null>(null);
  readonly statusPaymentBank = signal<StatusPaymentBankEnum[] | null>(null);
  readonly modalityPaymentBank = signal<ModalityPaymentBankEnum[] | null>(null);

  readonly releaseValueEnd = signal<number | null>(null);
  readonly releaseValueStart = signal<number | null>(null);

  readonly isReleaseDateDisabled = computed(() => !this.periodReleaseDate());

  /* Campos Tabela */
  readonly documentColumnDraft = signal('');
  readonly bankHistoryColumnDraft = signal('');
  readonly releaseValueColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly bankColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);
  readonly releaseDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly releaseDateColumnDraft = signal<string | string[] | null>(null);
  readonly releaseCategoryColumnDraft = signal<ReleaseCategoryEnum[] | null>(null);
  readonly statusPaymentBankColumnDraft = signal<StatusPaymentBankEnum[] | null>(null);
  readonly modalityPaymentBankColumnDraft = signal<ModalityPaymentBankEnum[] | null>(null);

  readonly statusPaymentBankOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusPaymentBankStatementEnum().map((value) => ({
      label: statusPaymentBankEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly releaseCategoryOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allReleaseCategoryEnum().map((value) => ({
      label: releaseCategoryLabel(value, this.i18n),
      value,
    }));
  });

  readonly modalityPaymentBankOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityPaymentBankEnum().map((value) => ({
      label: modalityPaymentBankLabel(value, this.i18n),
      value,
    }));
  });

  readonly releaseValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.releaseValueStart(),
    end: this.releaseValueEnd(),
  }));

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
    this.documentColumnDraft.set('');
    this.bankHistoryColumnDraft.set('');
    this.releaseValueColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.bankColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.releaseDateColumnDraft.set(null);
    this.releaseDateColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);
    this.releaseCategoryColumnDraft.set(null);
    this.statusPaymentBankColumnDraft.set(null);
    this.modalityPaymentBankColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  modalityPaymentBankLabel(value: ModalityPaymentBankEnum | null): string {
    return modalityPaymentBankLabel(value, this.i18n);
  }

  modalityPaymentBankSeverity(value: ModalityPaymentBankEnum | null): CsTagTone {
    return modalityPaymentBankSeverity(value);
  }

  statusPaymentBankLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }

  releaseCategoryLabel(value: ReleaseCategoryEnum | null): string {
    return releaseCategoryLabel(value, this.i18n);
  }

  releaseCategorySeverity(value: ReleaseCategoryEnum | null): CsTagTone {
    return releaseCategorySeverity(value);
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
    const releaseCategory = this.releaseCategory();
    const statusPaymentBank = this.statusPaymentBank();
    const modalityPaymentBank = this.modalityPaymentBank();

    const releaseDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodReleaseDate(),
      this.releaseDate(),
      this.i18n,
    );
    if (releaseDateValue) {
      items.push({
        label: this.i18n.tUi('bankStatement.fields.releaseDate'),
        value: releaseDateValue,
      });
    }

    const releaseValueEnd = this.releaseValueEnd();
    const releaseValueStart = this.releaseValueStart();
    const releaseValueLabel = currencyRangeLabel(this.i18n, releaseValueStart, releaseValueEnd);
    if (releaseValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.releaseValue'),
        value: releaseValueLabel,
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

    if (releaseCategory?.length) {
      items.push({
        label: this.i18n.tUi('bankStatement.fields.releaseCategory'),
        value: releaseCategory.map((v) => releaseCategoryLabel(v, this.i18n)).join(', '),
      });
    }

    if (modalityPaymentBank?.length) {
      items.push({
        label: this.i18n.tUi('bankStatement.fields.modalityPaymentBank'),
        value: modalityPaymentBank.map((v) => modalityPaymentBankLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  protected override buildAdvancedFilters(): Partial<BankStatementAdvancedFilters> {
    const releaseValueEnd = this.releaseValueEnd();
    const releaseValueStart = this.releaseValueStart();

    return {
      releaseDate: this.releaseDate() ?? undefined,
      periodReleaseDate: this.periodReleaseDate() ?? undefined,

      releaseValueEnd: releaseValueEnd ?? undefined,
      releaseValueStart: releaseValueStart ?? undefined,

      releaseCategory: this.releaseCategory()?.length ? this.releaseCategory()! : undefined,
      statusPaymentBank: this.statusPaymentBank()?.length ? this.statusPaymentBank()! : undefined,
      modalityPaymentBank: this.modalityPaymentBank()?.length
        ? this.modalityPaymentBank()!
        : undefined,

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
      'releaseCategory',
      this.releaseCategoryColumnDraft,
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
      'modalityPaymentBank',
      this.modalityPaymentBankColumnDraft,
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
      'releaseValue',
      this.releaseValueColumnDraft,
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
      releaseDate: this.releaseDate(),
      periodReleaseDate: this.periodReleaseDate(),

      releaseValueEnd: this.releaseValueEnd(),
      releaseValueStart: this.releaseValueStart(),

      releaseCategory: this.releaseCategory(),
      statusPaymentBank: this.statusPaymentBank(),
      modalityPaymentBank: this.modalityPaymentBank(),

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

    this.releaseValueEnd.set(s.releaseValueEnd ?? null);
    this.releaseValueStart.set(s.releaseValueStart ?? null);

    this.releaseDate.set(s.releaseDate ?? null);
    this.periodReleaseDate.set(s.periodReleaseDate ?? null);

    this.releaseCategory.set(s.releaseCategory ?? null);
    this.statusPaymentBank.set(s.statusPaymentBank ?? null);
    this.modalityPaymentBank.set(s.modalityPaymentBank ?? null);
  }

  protected onReleaseValueRangeChange(value: CsCurrencyRangeValue): void {
    this.releaseValueStart.set(value.start ?? null);
    this.releaseValueEnd.set(value.end ?? null);
  }

  protected bankingDomicileLabel(row: BankStatementModel): string {
    const agency = row.bankingDomicile?.agency ?? '-';
    const account = row.bankingDomicile?.currentAccount ?? '-';
    return `Ag. ${agency} Cc. ${account}`;
  }

  protected formatHistoric(domicile: BankStatementModel): string {
    if (domicile) {
      return `${domicile?.historicalCodeBank} - ${domicile?.descriptionHistoricalBank} `;
    }
    return ``;
  }

  protected searchActions(row: BankStatementModel): MenuItem[] {
    const reconciled = row.statusPaymentBank === StatusPaymentBankEnum.PAID;

    return [
      {
        label: this.i18n.tUi('common.search.creditOrder'),
        icon: 'pi pi-search',
        disabled: !reconciled,
        command: () => this.searchOnCreditOrder(row),
      },
    ];
  }

  protected confirmUndoReconciliation(row: BankStatementModel): void {
    this.confirm.confirm({
      header: this.i18n.tUi('bankStatement.undoReconciliation.header'),
      message: this.i18n.tUi('bankStatement.undoReconciliation.message'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-warn',
      acceptLabel: this.i18n.tUi('common.yes'),
      rejectLabel: this.i18n.tUi('common.no'),
      accept: () => this.undoReconciliation(row),
    });
  }

  private undoReconciliation(row: BankStatementModel): void {
    this.manualBankReconciliationApi.undoReconciliation(row.id).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('bankStatement.undoReconciliation.success', {
            creditOrdersUnlinked: result.creditOrdersUnlinked,
          }),
        });
        this.facade.reloadLast();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('bankStatement.undoReconciliation.error'),
        });
      },
    });
  }

  protected confirmDeleteManual(row: BankStatementModel): void {
    this.confirm.confirm({
      header: this.i18n.tUi('bankStatement.deleteManual.header'),
      message: this.i18n.tUi('bankStatement.deleteManual.message'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.i18n.tUi('common.yes'),
      rejectLabel: this.i18n.tUi('common.no'),
      accept: () => {
        this.facade.deleteManual(row.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.i18n.tUi('common.success'),
              detail: this.i18n.tUi('bankStatement.deleteManual.success'),
            });
            this.facade.reloadLast();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: this.i18n.tUi('common.error'),
              detail: this.i18n.tUi('bankStatement.deleteManual.error'),
            });
          },
        });
      },
    });
  }

  /**
   * Abre as ordens de crédito vinculadas a este lançamento bancário. Só é
   * chamado quando o lançamento já está conciliado (statusPaymentBank = PAID);
   * o item de menu correspondente fica desabilitado nos demais casos.
   */
  protected searchOnCreditOrder(row: BankStatementModel): void {
    const targetFilters = {
      ...createEmptyCreditOrderFiltersState(),
      flags: row.flag?.id ? [row.flag.id] : null,
      companies: row.company?.id ? [row.company.id] : null,
      acquirers: row.acquirer?.id ? [row.acquirer.id] : null,
      establishments: row.establishment?.id ? [row.establishment.id] : null,

      releaseValueStart: row.releaseValue ?? null,
      releaseValueEnd: row.releaseValue ?? null,
      statusPaymentBank: [StatusPaymentBankEnum.PAID],
    };

    localStorage.setItem(STATE_KEY.CARDSYNC.CREDIT_ORDER.FILTERS.V1, JSON.stringify(targetFilters));
    localStorage.removeItem(STATE_KEY.CARDSYNC.CREDIT_ORDER.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/credit-order']);
  }

  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }
}
