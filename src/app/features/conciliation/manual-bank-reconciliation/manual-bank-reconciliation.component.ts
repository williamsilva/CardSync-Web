import { FormsModule } from '@angular/forms';
import { Component, OnInit, WritableSignal, computed, inject, signal } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { BankFacade } from '@features/facade/bank.facade';
import { PersistedFilters } from '@shared/utils/persisted-filters';
import { FlagFacade } from '@features/facade/flag.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CreditOrderApiModel } from '@models/credit-order.model';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { BankStatementApiModel } from '@models/bank-statement.model';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { CreditOrderAdvancedFilters } from '@features/filter/credit-order.filters';
import { BankStatementAdvancedFilters } from '@features/filter/bank-statement.filters';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { mapPrimeLazyToTableQuery } from '@shared/features/list-query/primeng-lazy.mapper';
import { ManualBankReconciliationFacade } from '@features/facade/manual-bank-reconciliation.facade';
import { ReconciliationSettingsApiService } from '@features/service/reconciliation-settings.api.service';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import {
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';
import {
  StatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';
import {
  ModalityPaymentBankEnum,
  modalityPaymentBankLabel,
  modalityPaymentBankSeverity,
} from '@models/enums/modality-payment-bank.enum';
import {
  ActiveFilterItem,
  ActiveFilterGroup,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';

type CreditOrderRow = CreditOrderApiModel & {
  rvDate?: string | null;
  releaseValue?: number | null;
  statusPaymentBank?: StatusPaymentBankEnum | null;
};

interface ReleaseFiltersState {
  releaseBanks: string[] | null;
  releaseFlags: string[] | null;
  releasePeriod: PeriodEnum | null;
  releaseCompanies: string[] | null;
  releaseAcquirers: string[] | null;
  releaseDate: string | string[] | null;
  releaseValueStart: number | null;
  releaseValueEnd: number | null;
}

interface OrderFiltersState {
  orderReleasePeriod: PeriodEnum | null;
  orderReleaseDate: string | string[] | null;
  orderReleaseValueStart: number | null;
  orderReleaseValueEnd: number | null;
}

@Component({
  standalone: true,
  selector: 'cs-manual-bank-reconciliation',
  providers: [ConfirmationService, MessageService],
  templateUrl: './manual-bank-reconciliation.component.html',
  styles: [
    `
      :host ::ng-deep .cs-row-selected td {
        background-color: var(--highlight-bg) !important;
        color: var(--highlight-text-color);
      }
    `,
  ],
  imports: [
    CsDatePipe,
    FormsModule,
    TableModule,
    ToastModule,
    ButtonModule,
    TooltipModule,
    CsCurrencyPipe,
    CheckboxModule,
    CsTagComponent,
    TranslateModule,
    ConfirmDialogModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsCurrencyRangeFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
  ],
})
export class ManualBankReconciliationComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly messageService = inject(MessageService);
  private readonly translateSvc = inject(TranslateService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly bankFacade = inject(BankFacade);
  private readonly flagFacade = inject(FlagFacade);
  private readonly companyFacade = inject(CompanyFacade);
  readonly facade = inject(ManualBankReconciliationFacade);
  private readonly acquirerFacade = inject(AcquirerFacade);
  private readonly settingsApi = inject(ReconciliationSettingsApiService);

  /** Persistência dos filtros avançados (localStorage) para sobreviver a atualização de página, igual ao BankStatementListComponent. */
  private readonly persistedReleaseFilters = new PersistedFilters<ReleaseFiltersState>(
    STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_BANK_RECONCILIATION.RELEASE_FILTERS.V1,
  );
  private readonly persistedOrderFilters = new PersistedFilters<OrderFiltersState>(
    STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_BANK_RECONCILIATION.ORDER_FILTERS.V1,
  );

  /** Data-limite (go-live + N meses): lançamentos com data até ela podem ser marcados como legado. */
  private readonly legacyMarkingCutoffDate = signal<string | null>(null);

  /** Dias permitidos antes/depois da data do lançamento bancário para busca de ordens de crédito (configuração de conciliação). */
  private readonly bankDateToleranceDaysBefore = signal(0);
  private readonly bankDateToleranceDaysAfter = signal(0);

  /** Botão de legado visível somente para lançamento selecionado dentro da janela. */
  readonly canMarkLegacySelected = computed(() => {
    const release = this.facade.selectedRelease();
    return !!release && this.isEligibleForLegacy(release);
  });

  /** Valor total dos lançamentos selecionados em lote para marcação de legado. */
  readonly selectedReleasesTotalValue = computed(() =>
    this.facade.selectedReleases().reduce((sum, r) => sum + (r.releaseValue ?? 0), 0),
  );

  /** Chave de estado (PrimeNG stateStorage="local") para ordenação/paginação/filtros de coluna persistirem entre recargas de página. */
  protected readonly releasesTableStateKey =
    STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_BANK_RECONCILIATION.RELEASES_TABLE.STATE.V1;
  protected readonly ordersTableStateKey =
    STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_BANK_RECONCILIATION.ORDERS_TABLE.STATE.V1;
  private readonly tableRowsKey =
    STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_BANK_RECONCILIATION.TABLE.ROWS.V1;

  rows = Number(localStorage.getItem(this.tableRowsKey)) || 15;
  readonly rowsPerPageOptions = [13, 15, 30, 50, 100];

  private readonly lastOrdersEvent = signal<any>(null);
  private readonly lastReleasesEvent = signal<any>(null);

  // Release filters
  readonly releaseBanks = signal<string[] | null>(null);
  readonly releaseFlags = signal<string[] | null>(null);
  readonly releasePeriod = signal<PeriodEnum | null>(null);
  readonly releaseCompanies = signal<string[] | null>(null);
  readonly releaseAcquirers = signal<string[] | null>(null);
  readonly releaseDate = signal<string | string[] | null>(null);

  // Order filters
  readonly orderReleasePeriod = signal<PeriodEnum | null>(null);
  readonly orderReleaseDate = signal<string | string[] | null>(null);

  readonly releaseValueEnd = signal<number | null>(null);
  readonly releaseValueStart = signal<number | null>(null);

  readonly orderReleaseValueEnd = signal<number | null>(null);
  readonly orderReleaseValueStart = signal<number | null>(null);

  // Options
  readonly banksOptions = this.bankFacade.options;
  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.activeOptions;

  readonly isReleaseDateDisabled = computed(() => !this.releasePeriod());
  readonly isOrderReleaseDateDisabled = computed(() => !this.orderReleasePeriod());
  readonly creditOrderRows = computed(() => this.facade.orders() as CreditOrderRow[]);

  readonly selectedOrdersTotalValue = computed(() =>
    this.facade
      .selectedOrders()
      .reduce((sum, o) => sum + ((o as CreditOrderRow).releaseValue ?? 0), 0),
  );

  readonly valuesMatch = computed(() => {
    const release = this.facade.selectedRelease();
    const orders = this.facade.selectedOrders();
    if (!release || !orders.length) return false;
    return (
      Math.round(this.selectedOrdersTotalValue() * 100) ===
      Math.round((release.releaseValue ?? 0) * 100)
    );
  });

  readonly canReconcile = computed(
    () => this.facade.selectedOrders().length > 0 && this.valuesMatch(),
  );

  readonly valueDifference = computed(() => {
    const release = this.facade.selectedRelease();
    if (!release || !this.facade.selectedOrders().length) return null;
    return (release.releaseValue ?? 0) - this.selectedOrdersTotalValue();
  });

  readonly orderReleaseValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.orderReleaseValueStart(),
    end: this.orderReleaseValueEnd(),
  }));

  readonly releaseValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.releaseValueStart(),
    end: this.releaseValueEnd(),
  }));

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  readonly releaseActiveFilterGroups = computed<ActiveFilterGroup[]>(() => {
    const items: ActiveFilterItem[] = [];

    const dateValue = this.formatPeriodDateLabel(this.releasePeriod(), this.releaseDate());
    if (dateValue) {
      items.push({ label: this.i18n.tUi('bankStatement.fields.releaseDate'), value: dateValue });
    }

    const companies = this.releaseCompanies();
    if (companies?.length) {
      const labels = this.companiesOptions()
        .filter((o) => companies.includes(o.id))
        .map((o) => o.fantasyName)
        .join(', ');
      items.push({
        label: this.i18n.tUi('bankStatement.fields.company'),
        value: labels || String(companies.length),
      });
    }

    const banks = this.releaseBanks();
    if (banks?.length) {
      const labels = this.banksOptions()
        .filter((o) => banks.includes(o.id))
        .map((o) => o.name)
        .join(', ');
      items.push({
        label: this.i18n.tUi('bankStatement.fields.bank'),
        value: labels || String(banks.length),
      });
    }

    const releaseValueEnd = this.releaseValueEnd();
    const releaseValueStart = this.releaseValueStart();
    if (releaseValueStart != null || releaseValueEnd != null) {
      const parts = [
        releaseValueStart != null ? String(releaseValueStart) : null,
        releaseValueEnd != null ? String(releaseValueEnd) : null,
      ].filter(Boolean);
      items.push({
        label: this.i18n.tUi('bankStatement.fields.releaseValue'),
        value: parts.join(' - '),
      });
    }

    const acquirers = this.releaseAcquirers();
    if (acquirers?.length) {
      const labels = this.acquirersOptions()
        .filter((o) => acquirers.includes(o.id))
        .map((o) => o.fantasyName)
        .join(', ');
      items.push({
        label: this.i18n.tUi('bankStatement.fields.acquirer'),
        value: labels || String(acquirers.length),
      });
    }

    const flags = this.releaseFlags();
    if (flags?.length) {
      const labels = this.flagsOptions()
        .filter((o) => flags.includes(o.id))
        .map((o) => o.name)
        .join(', ');
      items.push({
        label: this.i18n.tUi('bankStatement.fields.flag'),
        value: labels || String(flags.length),
      });
    }

    if (!items.length) return [];
    return [{ title: this.i18n.tUi('common.advancedFilters'), filters: items }];
  });

  readonly releaseActiveFiltersCount = computed(() =>
    this.releaseActiveFilterGroups().reduce((n, g) => n + g.filters.length, 0),
  );

  readonly orderActiveFilterGroups = computed<ActiveFilterGroup[]>(() => {
    const items: ActiveFilterItem[] = [];

    const dateValue = this.formatPeriodDateLabel(
      this.orderReleasePeriod(),
      this.orderReleaseDate(),
    );
    if (dateValue) {
      items.push({ label: this.i18n.tUi('bankStatement.fields.releaseDate'), value: dateValue });
    }

    const valueStart = this.orderReleaseValueStart();
    const valueEnd = this.orderReleaseValueEnd();
    if (valueStart != null || valueEnd != null) {
      const parts = [
        valueStart != null ? String(valueStart) : null,
        valueEnd != null ? String(valueEnd) : null,
      ].filter(Boolean);
      items.push({
        label: this.i18n.tUi('bankStatement.fields.releaseValue'),
        value: parts.join(' - '),
      });
    }

    if (!items.length) return [];
    return [{ title: this.i18n.tUi('common.advancedFilters'), filters: items }];
  });

  readonly orderActiveFiltersCount = computed(() =>
    this.orderActiveFilterGroups().reduce((n, g) => n + g.filters.length, 0),
  );

  /**
   * PrimeNG restaura o estado da tabela (ordenação/página/filtros de coluna) de
   * forma assíncrona, como parte do próprio ciclo de vida do p-table — tarde
   * demais para a PRIMEIRA consulta ao backend, que já dispararíamos aqui sem
   * ordenação. Por isso lemos a mesma chave do localStorage manualmente antes
   * do primeiro reload, e ignoramos o (onLazyLoad) "eco" que o PrimeNG dispara
   * logo depois com os mesmos dados (senão a consulta correta, feita por nós,
   * corre o risco de ser descartada pelo guard de "loading" da segunda chamada).
   */
  private skipNextReleasesLazy = false;
  private skipNextOrdersLazy = false;

  ngOnInit(): void {
    this.settingsApi.getSettings().subscribe({
      next: (settings) => {
        this.legacyMarkingCutoffDate.set(settings.legacyMarkingCutoffDate);
        this.bankDateToleranceDaysBefore.set(settings.dateToleranceDaysBefore);
        this.bankDateToleranceDaysAfter.set(settings.dateToleranceDaysAfter);
      },
    });
    this.companyFacade.loadCompanyOptionsFilter();
    this.bankFacade.loadBankOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.flagFacade.loadFlagOptionsFilter();
    this.applyPersistedFilters();
    this.restoreReleasesTableState();
    this.restoreOrdersTableState();
    this.reloadReleases();
    this.reloadOrders();
  }

  private restoreReleasesTableState(): void {
    const restored = this.readTableState(this.releasesTableStateKey);
    if (!restored) return;
    this.lastReleasesEvent.set({
      first: restored.first ?? 0,
      rows: this.rows,
      sortField: restored.sortField,
      sortOrder: restored.sortOrder,
      multiSortMeta: restored.multiSortMeta,
      filters: restored.filters,
    });
    this.skipNextReleasesLazy = true;
  }

  private restoreOrdersTableState(): void {
    const restored = this.readTableState(this.ordersTableStateKey);
    if (!restored) return;
    this.lastOrdersEvent.set({
      first: restored.first ?? 0,
      rows: this.rows,
      sortField: restored.sortField,
      sortOrder: restored.sortOrder,
      multiSortMeta: restored.multiSortMeta,
      filters: restored.filters,
    });
    this.skipNextOrdersLazy = true;
  }

  private readTableState(key: string): any | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /** Restaura os filtros avançados salvos (localStorage) de uma sessão anterior, se houver. */
  private applyPersistedFilters(): void {
    const releaseFilters = this.persistedReleaseFilters.load();
    if (releaseFilters) this.applyReleaseFiltersState(releaseFilters);

    const orderFilters = this.persistedOrderFilters.load();
    if (orderFilters) this.applyOrderFiltersState(orderFilters);
  }

  private toReleaseFiltersState(): ReleaseFiltersState {
    return {
      releaseBanks: this.releaseBanks(),
      releaseFlags: this.releaseFlags(),
      releasePeriod: this.releasePeriod(),
      releaseCompanies: this.releaseCompanies(),
      releaseAcquirers: this.releaseAcquirers(),
      releaseDate: this.releaseDate(),
      releaseValueStart: this.releaseValueStart(),
      releaseValueEnd: this.releaseValueEnd(),
    };
  }

  private applyReleaseFiltersState(state: ReleaseFiltersState): void {
    this.releaseBanks.set(state.releaseBanks ?? null);
    this.releaseFlags.set(state.releaseFlags ?? null);
    this.releasePeriod.set(state.releasePeriod ?? null);
    this.releaseCompanies.set(state.releaseCompanies ?? null);
    this.releaseAcquirers.set(state.releaseAcquirers ?? null);
    this.releaseDate.set(state.releaseDate ?? null);
    this.releaseValueStart.set(state.releaseValueStart ?? null);
    this.releaseValueEnd.set(state.releaseValueEnd ?? null);
  }

  private toOrderFiltersState(): OrderFiltersState {
    return {
      orderReleasePeriod: this.orderReleasePeriod(),
      orderReleaseDate: this.orderReleaseDate(),
      orderReleaseValueStart: this.orderReleaseValueStart(),
      orderReleaseValueEnd: this.orderReleaseValueEnd(),
    };
  }

  private applyOrderFiltersState(state: OrderFiltersState): void {
    this.orderReleasePeriod.set(state.orderReleasePeriod ?? null);
    this.orderReleaseDate.set(state.orderReleaseDate ?? null);
    this.orderReleaseValueStart.set(state.orderReleaseValueStart ?? null);
    this.orderReleaseValueEnd.set(state.orderReleaseValueEnd ?? null);
  }

  search(): void {
    this.persistedReleaseFilters.save(this.toReleaseFiltersState());
    this.persistedOrderFilters.save(this.toOrderFiltersState());

    if (this.lastReleasesEvent()) {
      this.lastReleasesEvent.update((e) => ({ ...e, first: 0 }));
    }
    if (this.lastOrdersEvent()) {
      this.lastOrdersEvent.update((e) => ({ ...e, first: 0 }));
    }
    this.reloadReleases();
    this.reloadOrders();
  }

  searchReleases(): void {
    this.persistedReleaseFilters.save(this.toReleaseFiltersState());
    this.lastReleasesEvent.update((e) => (e ? { ...e, first: 0 } : null));
    this.reloadReleases();
  }

  searchOrders(): void {
    this.persistedOrderFilters.save(this.toOrderFiltersState());
    this.lastOrdersEvent.update((e) => (e ? { ...e, first: 0 } : null));
    this.reloadOrders();
  }

  clearReleaseFilters(): void {
    this.releaseDate.set(null);
    this.releaseBanks.set(null);
    this.releaseFlags.set(null);
    this.releasePeriod.set(null);
    this.releaseValueEnd.set(null);
    this.releaseCompanies.set(null);
    this.releaseAcquirers.set(null);
    this.lastReleasesEvent.set(null);
    this.releaseValueStart.set(null);
    this.persistedReleaseFilters.clear();
    this.reloadReleases();
  }

  clearOrderFilters(): void {
    this.orderReleaseDate.set(null);
    this.orderReleasePeriod.set(null);
    this.lastOrdersEvent.set(null);
    this.orderReleaseValueEnd.set(null);
    this.orderReleaseValueStart.set(null);
    this.persistedOrderFilters.clear();
    this.reloadOrders();
  }

  /** Cancela a seleção de lançamento(s) e limpa o filtro de período de ordens aplicado automaticamente. */
  cancelSelection(): void {
    this.facade.clearSelection();
    this.orderReleasePeriod.set(null);
    this.orderReleaseDate.set(null);
    this.lastOrdersEvent.set(null);
    this.reloadOrders();
  }

  onReleasesLazyLoad(event: any): void {
    this.lastReleasesEvent.set(event);
    if (this.skipNextReleasesLazy) {
      this.skipNextReleasesLazy = false;
      return;
    }
    this.reloadReleases();
  }

  onOrdersLazyLoad(event: any): void {
    this.lastOrdersEvent.set(event);
    if (this.skipNextOrdersLazy) {
      this.skipNextOrdersLazy = false;
      return;
    }
    this.reloadOrders();
  }

  onReleasesPageChange(event: any): void {
    this.rows = event.rows;
    localStorage.setItem(this.tableRowsKey, String(this.rows));
  }

  onOrdersPageChange(event: any): void {
    this.rows = event.rows;
    localStorage.setItem(this.tableRowsKey, String(this.rows));
  }

  /**
   * Seleção de lançamentos: normalmente única (1 lançamento por vez, para
   * conciliação com ordens de crédito). Quando todos os lançamentos já
   * selecionados são elegíveis para marcação de legado e o novo clique também é
   * elegível, acumula na seleção em vez de substituir — permitindo marcar vários
   * de uma vez. Clicar em um lançamento não elegível sempre volta ao modo único.
   */
  selectRelease(release: BankStatementApiModel): void {
    const eligible = this.isEligibleForLegacy(release);
    const current = this.facade.selectedReleases();
    const currentAllEligible = current.length > 0 && current.every((r) => this.isEligibleForLegacy(r));

    if (eligible && (current.length === 0 || currentAllEligible)) {
      this.facade.toggleReleaseInSelection(release);
    } else {
      const isOnlySelected = current.length === 1 && current[0].id === release.id;
      this.facade.selectSingleRelease(isOnlySelected ? null : release);
    }

    this.applyOrderDateRangeForSelection();
    this.lastOrdersEvent.set(null);
    this.reloadOrders();
  }

  /**
   * Ao selecionar um único lançamento bancário, filtra as ordens de crédito por
   * período (intervalo), usando a data do lançamento ± os dias de tolerância
   * configurados em conciliação (Dias anteriores/posteriores permitidos - banco).
   * Sem exatamente 1 lançamento selecionado, o filtro de período é limpo.
   */
  private applyOrderDateRangeForSelection(): void {
    const releases = this.facade.selectedReleases();

    if (releases.length !== 1 || !releases[0].releaseDate) {
      this.orderReleasePeriod.set(null);
      this.orderReleaseDate.set(null);
      return;
    }

    const base = this.parseIsoDate(releases[0].releaseDate);
    if (!base) {
      this.orderReleasePeriod.set(null);
      this.orderReleaseDate.set(null);
      return;
    }

    const start = new Date(base);
    start.setDate(start.getDate() - this.bankDateToleranceDaysBefore());
    const end = new Date(base);
    end.setDate(end.getDate() + this.bankDateToleranceDaysAfter());

    this.orderReleasePeriod.set(PeriodEnum.INTERVAL);
    this.orderReleaseDate.set([this.formatBrDate(start), this.formatBrDate(end)]);
  }

  private parseIsoDate(value: string): Date | null {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  /** dd/MM/yyyy — formato esperado pelo p-datepicker (dataType="string", dateFormat="dd/mm/yy"). */
  private formatBrDate(value: Date): string {
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${day}/${month}/${value.getFullYear()}`;
  }

  isReleaseSelected(release: BankStatementApiModel): boolean {
    return this.facade.selectedReleases().some((r) => r.id === release.id);
  }

  /**
   * Um lançamento fica indisponível para seleção quando já há uma seleção em
   * lote (2+ elegíveis) e ele não é elegível — evita que um clique acidental
   * substitua o lote acumulado por um único lançamento não elegível.
   */
  isReleaseSelectable(release: BankStatementApiModel): boolean {
    const current = this.facade.selectedReleases();
    if (current.length <= 1) return true;
    return this.isEligibleForLegacy(release);
  }

  private isEligibleForLegacy(release: BankStatementApiModel): boolean {
    const cutoff = this.legacyMarkingCutoffDate();
    if (!cutoff) return true;
    const releaseDate = String(release.releaseDate ?? '').slice(0, 10);
    return !!releaseDate && releaseDate <= cutoff;
  }

  confirmReconcile(): void {
    const count = this.facade.selectedOrders().length;
    this.confirmationService.confirm({
      message: this.translateSvc.instant('conciliation.manualBankReconciliation.confirmMessage', {
        count,
      }),
      header: this.translateSvc.instant('conciliation.manualBankReconciliation.confirmTitle'),
      icon: 'pi pi-link',
      acceptLabel: this.translateSvc.instant('conciliation.manualBankReconciliation.link'),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.doReconcile(),
    });
  }

  confirmMarkLegacy(): void {
    const count = this.facade.selectedReleases().length;
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.markLegacyConfirmMessage',
        { count },
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.markLegacyConfirmTitle',
      ),
      icon: 'pi pi-history',
      acceptLabel: this.translateSvc.instant('conciliation.manualBankReconciliation.markLegacy'),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doMarkLegacy(),
    });
  }

  private doMarkLegacy(): void {
    this.facade.markLegacy().subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.markLegacySuccess',
            { updated: result.updated },
          ),
        });
        this.reloadReleases();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('common.errorMessage'),
        });
      },
    });
  }

  statusPaymentBankLabel(value: StatusPaymentBankEnum | null | undefined): string {
    return statusPaymentBankEnumLabel(value ?? null, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null | undefined): CsTagTone {
    return statusPaymentBankEnumSeverity(value ?? null);
  }

  modalityPaymentBankLabel(value: ModalityPaymentBankEnum | null | undefined): string {
    return modalityPaymentBankLabel(value ?? null, this.i18n);
  }

  modalityPaymentBankSeverity(value: ModalityPaymentBankEnum | null | undefined): CsTagTone {
    return modalityPaymentBankSeverity(value ?? null);
  }

  onPeriodColumnChange(
    periodSignal: WritableSignal<PeriodEnum | null>,
    valueSignal: WritableSignal<string | string[] | null>,
    period: PeriodEnum | null,
  ): void {
    periodSignal.set(period);
    valueSignal.set(null);
  }

  setViewFormat(period: PeriodEnum | null): string {
    if (period === PeriodEnum.YEAR) return 'year';
    if (period === PeriodEnum.MONTH) return 'month';
    return 'date';
  }

  setDateFormat(period: PeriodEnum | null): string {
    return this.i18n.getDateFormatByPeriod(period);
  }

  setSelectionMode(period: PeriodEnum | null): string {
    return period === PeriodEnum.INTERVAL ? 'range' : 'single';
  }

  protected refresh(): void {
    this.reloadReleases();
    this.reloadOrders();
  }

  private doReconcile(): void {
    this.facade.reconcile().subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant('conciliation.manualBankReconciliation.linkSuccess', {
            reconciled: result.reconciled,
            zeroValueReconciled: result.zeroValueReconciled,
          }),
        });
        this.reloadReleases();
        this.clearOrderFilters();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('common.errorMessage'),
        });
      },
    });
  }

  private reloadReleases(): void {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastReleasesEvent() ?? { first: 0, rows: this.rows },
      this.rows,
    );
    const query = buildListQuery<BankStatementAdvancedFilters>(
      tableQuery,
      this.buildReleasesAdvancedFilters(),
    );
    this.facade.loadReleases(query);
  }

  private reloadOrders(): void {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastOrdersEvent() ?? { first: 0, rows: this.rows },
      this.rows,
    );
    const query = buildListQuery<CreditOrderAdvancedFilters>(
      tableQuery,
      this.buildOrdersAdvancedFilters(),
    );
    this.facade.loadOrders(query);
  }

  private buildReleasesAdvancedFilters(): Partial<BankStatementAdvancedFilters> {
    return {
      releaseDate: this.releaseDate() ?? undefined,
      periodReleaseDate: this.releasePeriod() ?? undefined,

      releaseValueEnd: this.releaseValueEnd() ?? undefined,
      releaseValueStart: this.releaseValueStart() ?? undefined,

      statusPaymentBank: [StatusPaymentBankEnum.PENDING],
      banks: this.releaseBanks()?.length ? this.releaseBanks()! : undefined,
      flags: this.releaseFlags()?.length ? this.releaseFlags()! : undefined,
      companies: this.releaseCompanies()?.length ? this.releaseCompanies()! : undefined,
      acquirers: this.releaseAcquirers()?.length ? this.releaseAcquirers()! : undefined,
    };
  }

  onReleaseValueRangeChange(value: CsCurrencyRangeValue): void {
    this.releaseValueStart.set(value.start ?? null);
    this.releaseValueEnd.set(value.end ?? null);
  }

  onOrderReleaseValueRangeChange(value: CsCurrencyRangeValue): void {
    this.orderReleaseValueStart.set(value.start ?? null);
    this.orderReleaseValueEnd.set(value.end ?? null);
  }

  private buildOrdersAdvancedFilters(): Partial<CreditOrderAdvancedFilters> {
    const release = this.facade.selectedRelease();
    return {
      releaseDate: this.orderReleaseDate() ?? undefined,
      periodReleaseDate: this.orderReleasePeriod() ?? undefined,

      releaseValueEnd: this.orderReleaseValueEnd() ?? undefined,
      releaseValueStart: this.orderReleaseValueStart() ?? undefined,

      statusPaymentBank: [StatusPaymentBankEnum.PENDING],
      banks: release?.bank?.id ? [release.bank.id] : undefined,
      flags: release?.flag?.id ? [release.flag.id] : undefined,
      companies: release?.company?.id ? [release.company.id] : undefined,
      acquirers: release?.acquirer?.id ? [release.acquirer.id] : undefined,
    };
  }

  private formatPeriodDateLabel(
    period: PeriodEnum | null,
    date: string | string[] | null,
  ): string | null {
    const periodLabel = period ? periodEnumLabel(period, this.i18n) : null;
    const dateLabel = Array.isArray(date) ? date.filter(Boolean).join(' - ') : date;

    if (periodLabel && dateLabel) return `${periodLabel} - ${dateLabel}`;
    return periodLabel ?? dateLabel;
  }
}
