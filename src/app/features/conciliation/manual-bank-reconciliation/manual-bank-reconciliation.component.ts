import { FormsModule } from '@angular/forms';
import { Component, OnInit, WritableSignal, computed, inject, signal } from '@angular/core';

import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { BankFacade } from '@features/facade/bank.facade';
import { FlagFacade } from '@features/facade/flag.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CreditOrderApiModel } from '@models/credit-order.model';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { PersistedFilters } from '@williamsilva/nimbus-web-commons';
import { BankStatementApiModel } from '@models/bank-statement.model';
import { buildListQuery } from '@williamsilva/nimbus-web-commons';
import { CreditOrderAdvancedFilters } from '@features/filter/credit-order.filters';
import { CreditOrderApiService } from '@features/service/credit-order.api.service';
import { BankStatementAdvancedFilters } from '@features/filter/bank-statement.filters';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { ConciliationWaitingFacade } from '@features/facade/conciliation-waiting.facade';
import { mapPrimeLazyToTableQuery } from '@williamsilva/nimbus-web-commons';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';
import { DivergenceDialogComponent } from './divergence-dialog/divergence-dialog.component';
import { ManualBankReconciliationFacade } from '@features/facade/manual-bank-reconciliation.facade';
import { ReconciliationSettingsApiService } from '@features/service/reconciliation-settings.api.service';
import { CsAdvancedPeriodDateFilterComponent } from '@williamsilva/nimbus-web-commons';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import { NoCreditOrderLegacyDialogComponent } from './no-credit-order-legacy-dialog/no-credit-order-legacy-dialog.component';
import { PreImplantationDivergenceDialogComponent } from './pre-implantation-divergence-dialog/pre-implantation-divergence-dialog.component';
import { CreditOrderPreImplantationDialogComponent } from './credit-order-pre-implantation-dialog/credit-order-pre-implantation-dialog.component';
import { SalesSummaryPreImplantationDialogComponent } from './sales-summary-pre-implantation-dialog/sales-summary-pre-implantation-dialog.component';
import {
  ReconcileSalesSummaryCreditOrderResultModel,
  SalesSummaryPreImplantationPreviewResultModel,
} from '@models/conciliation-waiting.model';
import {
  CreditOrderPreImplantationLinkingApplyResult,
  CreditOrderPreImplantationLinkingPreviewResult,
} from '@features/models/credit-order.model';
import {
  NoCreditOrderLegacyPreviewResult,
  PreImplantationDivergencePreviewResult,
} from '@features/service/manual-bank-reconciliation.api.service';
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
} from '@williamsilva/nimbus-web-commons';

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
  orderBanks: string[] | null;
  orderFlags: string[] | null;
  orderCompanies: string[] | null;
  orderAcquirers: string[] | null;
  orderReleasePeriod: PeriodEnum | null;
  orderReleaseDate: string | string[] | null;
  orderReleaseValueStart: number | null;
  orderReleaseValueEnd: number | null;
}

@Component({
  standalone: true,
  selector: 'cs-manual-bank-reconciliation',
  templateUrl: './manual-bank-reconciliation.component.html',
  providers: [ConfirmationService, MessageService, CsCurrencyPipe],
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
    MenuModule,
    FormsModule,
    TableModule,
    ToastModule,
    ButtonModule,
    TooltipModule,
    CsCurrencyPipe,
    CheckboxModule,
    CsTagComponent,
    CsDocumentPipe,
    TranslateModule,
    ConfirmDialogModule,
    FiltersPanelComponent,
    DivergenceDialogComponent,
    CsCurrencyRangeFilterComponent,
    NoCreditOrderLegacyDialogComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
    PreImplantationDivergenceDialogComponent,
    CreditOrderPreImplantationDialogComponent,
    SalesSummaryPreImplantationDialogComponent,
  ],
})
export class ManualBankReconciliationComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly messageService = inject(MessageService);
  private readonly translateSvc = inject(TranslateService);
  protected readonly currencyPipe = inject(CsCurrencyPipe);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly bankFacade = inject(BankFacade);
  private readonly flagFacade = inject(FlagFacade);
  private readonly companyFacade = inject(CompanyFacade);
  readonly facade = inject(ManualBankReconciliationFacade);
  private readonly acquirerFacade = inject(AcquirerFacade);
  private readonly creditOrderApiService = inject(CreditOrderApiService);
  private readonly settingsApi = inject(ReconciliationSettingsApiService);
  private readonly conciliationWaitingFacade = inject(ConciliationWaitingFacade);

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
  private readonly releasesTableRowsKey =
    STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_BANK_RECONCILIATION.RELEASES_TABLE.ROWS.V1;
  private readonly ordersTableRowsKey =
    STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_BANK_RECONCILIATION.ORDERS_TABLE.ROWS.V1;

  releasesRows = Number(localStorage.getItem(this.releasesTableRowsKey)) || 15;
  ordersRows = Number(localStorage.getItem(this.ordersTableRowsKey)) || 15;
  readonly rowsPerPageOptions = [15, 30, 50, 100];

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
  readonly orderBanks = signal<string[] | null>(null);
  readonly orderFlags = signal<string[] | null>(null);
  readonly orderCompanies = signal<string[] | null>(null);
  readonly orderAcquirers = signal<string[] | null>(null);
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

  readonly showDivergenceDialog = signal(false);

  /** Diálogo de análise/prévia da divergência pré-implantação (ver openPreImplantationDivergencePreview). */
  protected readonly showPreImplantationPreviewDialog = signal(false);
  protected readonly preImplantationPreview = signal<PreImplantationDivergencePreviewResult | null>(
    null,
  );

  /** Diálogo de análise/prévia da marcação de legado sem ordem de crédito (ver openNoCreditOrderLegacyPreview). */
  protected readonly showNoCreditOrderLegacyPreviewDialog = signal(false);
  protected readonly noCreditOrderLegacyPreview = signal<NoCreditOrderLegacyPreviewResult | null>(
    null,
  );

  /** Diálogo de análise/prévia do backfill de SalesSummary pré-implantação (Etapa 6) — ver
   * openSalesSummaryPreImplantationPreview. Só estimativa agregada (sem lista de itens): a
   * ferramenta reavalia em lote, não por seleção individual. */
  protected readonly previewingSalesSummaryPreImplantation = signal(false);
  protected readonly applyingSalesSummaryPreImplantation = signal(false);
  protected readonly showSalesSummaryPreImplantationDialog = signal(false);
  protected readonly salesSummaryPreImplantationPreview =
    signal<SalesSummaryPreImplantationPreviewResultModel | null>(null);

  /** Diálogo de análise/prévia de vínculo de CreditOrder órfãs pré-implantação (Etapa 4/7) — ver
   * openCreditOrderPreImplantationPreview. Só estimativa agregada (sem lista de itens): igual ao
   * comportamento original na tela de Ordem de Pagamento Manual. */
  protected readonly previewingCreditOrderPreImplantation = signal(false);
  protected readonly applyingCreditOrderPreImplantation = signal(false);
  protected readonly showCreditOrderPreImplantationDialog = signal(false);
  protected readonly creditOrderPreImplantationPreview =
    signal<CreditOrderPreImplantationLinkingPreviewResult | null>(null);

  /** Verdadeiro enquanto qualquer uma das ferramentas do menu estiver rodando — mostra o spinner no botão "Ações". */
  protected readonly anyDataToolRunning = computed(
    () =>
      this.facade.reclassifyingFlags() ||
      this.facade.reclassifyingModality() ||
      this.facade.reclassifyingAcquirer() ||
      this.facade.reclassifyingEstablishment() ||
      this.facade.analyzingPreImplantationDivergence() ||
      this.facade.analyzingNoCreditOrderLegacy() ||
      this.previewingSalesSummaryPreImplantation() ||
      this.applyingSalesSummaryPreImplantation() ||
      this.previewingCreditOrderPreImplantation() ||
      this.applyingCreditOrderPreImplantation(),
  );

  /** Menu "Ações" no cabeçalho — agrupa os backfills/ferramentas de análise, deixando só "Atualizar" como botão direto. */
  protected readonly dataToolsMenuItems = computed<MenuItem[]>(() => [
    {
      label: this.i18n.tUi('conciliation.manualBankReconciliation.reclassifyFlags'),
      icon: 'pi pi-flag',
      disabled: this.facade.reclassifyingFlags(),
      command: () => this.confirmReclassifyFlags(),
    },
    {
      label: this.i18n.tUi('conciliation.manualBankReconciliation.reclassifyModality'),
      icon: 'pi pi-sync',
      disabled: this.facade.reclassifyingModality(),
      command: () => this.confirmReclassifyModality(),
    },
    {
      label: this.i18n.tUi('conciliation.manualBankReconciliation.reclassifyAcquirer'),
      icon: 'pi pi-briefcase',
      disabled: this.facade.reclassifyingAcquirer(),
      command: () => this.confirmReclassifyAcquirer(),
    },
    {
      label: this.i18n.tUi('conciliation.manualBankReconciliation.reclassifyEstablishment'),
      icon: 'pi pi-building',
      disabled: this.facade.reclassifyingEstablishment(),
      command: () => this.confirmReclassifyEstablishment(),
    },
    {
      label: this.i18n.tUi('conciliation.manualBankReconciliation.preImplantationAnalyze'),
      icon: 'pi pi-history',
      disabled: this.facade.analyzingPreImplantationDivergence(),
      command: () => this.openPreImplantationDivergencePreview(),
    },
    {
      label: this.i18n.tUi('conciliation.manualBankReconciliation.noCreditOrderLegacyAnalyze'),
      icon: 'pi pi-inbox',
      disabled: this.facade.analyzingNoCreditOrderLegacy(),
      command: () => this.openNoCreditOrderLegacyPreview(),
    },
    {
      label: this.i18n.tUi(
        'conciliation.manualBankReconciliation.salesSummaryPreImplantationAnalyze',
      ),
      icon: 'pi pi-database',
      disabled: this.previewingSalesSummaryPreImplantation(),
      command: () => this.openSalesSummaryPreImplantationPreview(),
    },
    {
      label: this.i18n.tUi(
        'conciliation.manualBankReconciliation.creditOrderPreImplantationAnalyze',
      ),
      icon: 'pi pi-link',
      disabled: this.previewingCreditOrderPreImplantation(),
      command: () => this.openCreditOrderPreImplantationPreview(),
    },
  ]);

  readonly canReconcile = computed(() => this.facade.selectedOrders().length > 0);

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

    const companies = this.orderCompanies();
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

    const banks = this.orderBanks();
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

    const acquirers = this.orderAcquirers();
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

    const flags = this.orderFlags();
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
      rows: this.releasesRows,
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
      rows: this.ordersRows,
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
      orderBanks: this.orderBanks(),
      orderFlags: this.orderFlags(),
      orderCompanies: this.orderCompanies(),
      orderAcquirers: this.orderAcquirers(),
      orderReleasePeriod: this.orderReleasePeriod(),
      orderReleaseDate: this.orderReleaseDate(),
      orderReleaseValueStart: this.orderReleaseValueStart(),
      orderReleaseValueEnd: this.orderReleaseValueEnd(),
    };
  }

  private applyOrderFiltersState(state: OrderFiltersState): void {
    this.orderBanks.set(state.orderBanks ?? null);
    this.orderFlags.set(state.orderFlags ?? null);
    this.orderCompanies.set(state.orderCompanies ?? null);
    this.orderAcquirers.set(state.orderAcquirers ?? null);
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
    this.orderBanks.set(null);
    this.orderFlags.set(null);
    this.orderCompanies.set(null);
    this.orderAcquirers.set(null);
    this.orderReleaseDate.set(null);
    this.orderReleasePeriod.set(null);
    this.lastOrdersEvent.set(null);
    this.orderReleaseValueEnd.set(null);
    this.orderReleaseValueStart.set(null);
    this.persistedOrderFilters.clear();
    this.reloadOrders();
  }

  /** Cancela a seleção de lançamento(s) e limpa os filtros de ordens aplicados automaticamente. */
  cancelSelection(): void {
    this.facade.clearSelection();
    this.clearOrderReleaseDerivedFilters();
    this.lastOrdersEvent.set(null);
    this.reloadOrders();
  }

  /** Limpa as ordens selecionadas. */
  clearSelectedOrders(): void {
    this.facade.clearOrders();
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
    this.releasesRows = event.rows;
    localStorage.setItem(this.releasesTableRowsKey, String(this.releasesRows));
  }

  onOrdersPageChange(event: any): void {
    this.ordersRows = event.rows;
    localStorage.setItem(this.ordersTableRowsKey, String(this.ordersRows));
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
    const currentAllEligible =
      current.length > 0 && current.every((r) => this.isEligibleForLegacy(r));

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
   * configurados em conciliação (Dias anteriores/posteriores permitidos - banco),
   * e também reflete banco/bandeira/empresa/adquirente do lançamento nos próprios
   * filtros do lado de ordens — antes esses 4 eram só um fallback dentro da query
   * (filtrava certo), mas não apareciam nos campos nem no contador "N filtros
   * ativos" do painel de ordens. Sem exatamente 1 lançamento selecionado, todos
   * esses filtros derivados são limpos.
   */
  private applyOrderDateRangeForSelection(): void {
    const releases = this.facade.selectedReleases();

    if (releases.length !== 1) {
      this.clearOrderReleaseDerivedFilters();
      return;
    }

    const release = releases[0];
    this.orderCompanies.set(release.company?.id ? [release.company.id] : null);
    this.orderBanks.set(release.bank?.id ? [release.bank.id] : null);
    this.orderAcquirers.set(release.acquirer?.id ? [release.acquirer.id] : null);
    this.orderFlags.set(release.flag?.id ? [release.flag.id] : null);

    if (!release.releaseDate) {
      this.orderReleasePeriod.set(null);
      this.orderReleaseDate.set(null);
      return;
    }

    const base = this.parseIsoDate(release.releaseDate);
    if (!base) {
      this.orderReleasePeriod.set(null);
      this.orderReleaseDate.set(null);
      return;
    }

    const start = new Date(base);
    start.setDate(start.getDate() - this.bankDateToleranceDaysAfter());
    const end = new Date(base);
    end.setDate(end.getDate() + this.bankDateToleranceDaysBefore());

    this.orderReleasePeriod.set(PeriodEnum.INTERVAL);
    this.orderReleaseDate.set([this.formatBrDate(start), this.formatBrDate(end)]);
  }

  /** Limpa período + banco/bandeira/empresa/adquirente derivados do lançamento selecionado. */
  private clearOrderReleaseDerivedFilters(): void {
    this.orderReleasePeriod.set(null);
    this.orderReleaseDate.set(null);
    this.orderCompanies.set(null);
    this.orderBanks.set(null);
    this.orderAcquirers.set(null);
    this.orderFlags.set(null);
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

  /**
   * Sem divergência: segue direto para o diálogo de confirmação simples, como antes. Com
   * divergência, abre um diálogo próprio pedindo a justificativa — o motivo só é solicitado
   * neste momento (ao clicar em Vincular), não fica um campo exposto o tempo todo na tela.
   */
  confirmReconcile(): void {
    if (!this.valuesMatch()) {
      this.showDivergenceDialog.set(true);
      return;
    }

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
      accept: () => this.doReconcile(null),
    });
  }

  protected divergenceDialogMessage(): string {
    return this.translateSvc.instant(
      'conciliation.manualBankReconciliation.divergenceDialogMessage',
      {
        count: this.facade.selectedOrders().length,
        difference: this.currencyPipe.transform(this.valueDifference()),
      },
    );
  }

  protected onDivergenceDialogVisibleChange(visible: boolean): void {
    this.showDivergenceDialog.set(visible);
  }

  protected onDivergenceConfirm(reason: string): void {
    this.showDivergenceDialog.set(false);
    this.doReconcile(reason);
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

  confirmReclassifyFlags(): void {
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyFlagsConfirmMessage',
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyFlagsConfirmTitle',
      ),
      icon: 'pi pi-refresh',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyFlags',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doReclassifyFlags(),
    });
  }

  confirmReclassifyModality(): void {
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyModalityConfirmMessage',
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyModalityConfirmTitle',
      ),
      icon: 'pi pi-refresh',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyModality',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doReclassifyModality(),
    });
  }

  confirmReclassifyAcquirer(): void {
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyAcquirerConfirmMessage',
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyAcquirerConfirmTitle',
      ),
      icon: 'pi pi-refresh',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyAcquirer',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doReclassifyAcquirer(),
    });
  }

  confirmReclassifyEstablishment(): void {
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyEstablishmentConfirmMessage',
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyEstablishmentConfirmTitle',
      ),
      icon: 'pi pi-refresh',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.reclassifyEstablishment',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doReclassifyEstablishment(),
    });
  }

  private doReclassifyFlags(): void {
    this.facade.reclassifyFlags().subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.reclassifyFlagsSuccess',
            result,
          ),
        });
        this.reloadReleases();
        this.reloadOrders();
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

  private doReclassifyModality(): void {
    this.facade.reclassifyModality().subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.reclassifyModalitySuccess',
            result,
          ),
        });
        this.reloadReleases();
        this.reloadOrders();
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

  private doReclassifyAcquirer(): void {
    this.facade.reclassifyAcquirer().subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.reclassifyAcquirerSuccess',
            result,
          ),
        });
        this.reloadReleases();
        this.reloadOrders();
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

  private doReclassifyEstablishment(): void {
    this.facade.reclassifyEstablishment().subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.reclassifyEstablishmentSuccess',
            result,
          ),
        });
        this.reloadReleases();
        this.reloadOrders();
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

  /** Abre o diálogo de análise: nunca grava nada, só lista o que applyPreImplantationDivergence executaria. */
  openPreImplantationDivergencePreview(): void {
    this.facade.previewPreImplantationDivergence().subscribe({
      next: (result) => {
        this.preImplantationPreview.set(result);
        this.showPreImplantationPreviewDialog.set(true);
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

  protected onPreImplantationPreviewDialogVisibleChange(visible: boolean): void {
    this.showPreImplantationPreviewDialog.set(visible);
    if (!visible) {
      this.preImplantationPreview.set(null);
    }
  }

  protected closePreImplantationPreviewDialog(): void {
    this.showPreImplantationPreviewDialog.set(false);
    this.preImplantationPreview.set(null);
  }

  protected onApplyPreImplantationDivergence(releaseBankIds: string[]): void {
    const eligible = releaseBankIds.length;
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.preImplantationApplyConfirmMessage',
        { eligible },
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.preImplantationApplyConfirmTitle',
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.preImplantationApply',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doApplyPreImplantationDivergence(releaseBankIds),
    });
  }

  private doApplyPreImplantationDivergence(releaseBankIds: string[]): void {
    this.facade.applyPreImplantationDivergence(releaseBankIds).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.preImplantationApplySuccess',
            result,
          ),
        });
        this.closePreImplantationPreviewDialog();
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

  /** Abre o diálogo de análise: nunca grava nada, só lista o que applyNoCreditOrderLegacyMarking executaria. */
  openNoCreditOrderLegacyPreview(): void {
    this.facade.previewNoCreditOrderLegacyMarking().subscribe({
      next: (result) => {
        this.noCreditOrderLegacyPreview.set(result);
        this.showNoCreditOrderLegacyPreviewDialog.set(true);
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

  protected onNoCreditOrderLegacyPreviewDialogVisibleChange(visible: boolean): void {
    this.showNoCreditOrderLegacyPreviewDialog.set(visible);
    if (!visible) {
      this.noCreditOrderLegacyPreview.set(null);
    }
  }

  protected closeNoCreditOrderLegacyPreviewDialog(): void {
    this.showNoCreditOrderLegacyPreviewDialog.set(false);
    this.noCreditOrderLegacyPreview.set(null);
  }

  protected onApplyNoCreditOrderLegacyMarking(releaseBankIds: string[]): void {
    const eligible = releaseBankIds.length;
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.noCreditOrderLegacyApplyConfirmMessage',
        { eligible },
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.noCreditOrderLegacyApplyConfirmTitle',
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.noCreditOrderLegacyApply',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doApplyNoCreditOrderLegacyMarking(releaseBankIds),
    });
  }

  private doApplyNoCreditOrderLegacyMarking(releaseBankIds: string[]): void {
    this.facade.applyNoCreditOrderLegacyMarking(releaseBankIds).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.noCreditOrderLegacyApplySuccess',
            result,
          ),
        });
        this.closeNoCreditOrderLegacyPreviewDialog();
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

  /** Abre o diálogo de análise: nunca grava nada, só estima o que applySalesSummaryCreditOrderPreImplantation executaria. */
  protected openSalesSummaryPreImplantationPreview(): void {
    if (this.previewingSalesSummaryPreImplantation()) return;
    this.previewingSalesSummaryPreImplantation.set(true);
    this.conciliationWaitingFacade.previewSalesSummaryCreditOrderPreImplantation().subscribe({
      next: (result) => {
        this.previewingSalesSummaryPreImplantation.set(false);
        this.salesSummaryPreImplantationPreview.set(result);
        this.showSalesSummaryPreImplantationDialog.set(true);
      },
      error: () => {
        this.previewingSalesSummaryPreImplantation.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('common.errorMessage'),
        });
      },
    });
  }

  protected onSalesSummaryPreImplantationDialogVisibleChange(visible: boolean): void {
    this.showSalesSummaryPreImplantationDialog.set(visible);
    if (!visible) {
      this.salesSummaryPreImplantationPreview.set(null);
    }
  }

  protected closeSalesSummaryPreImplantationDialog(): void {
    this.showSalesSummaryPreImplantationDialog.set(false);
    this.salesSummaryPreImplantationPreview.set(null);
  }

  protected confirmApplySalesSummaryPreImplantation(): void {
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.salesSummaryPreImplantationApplyConfirmMessage',
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.salesSummaryPreImplantationApplyConfirmTitle',
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.salesSummaryPreImplantationApply',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doApplySalesSummaryPreImplantation(),
    });
  }

  private doApplySalesSummaryPreImplantation(): void {
    if (this.applyingSalesSummaryPreImplantation()) return;
    this.applyingSalesSummaryPreImplantation.set(true);
    this.conciliationWaitingFacade.applySalesSummaryCreditOrderPreImplantation().subscribe({
      next: (result: ReconcileSalesSummaryCreditOrderResultModel) => {
        this.applyingSalesSummaryPreImplantation.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.salesSummaryPreImplantationApplySuccess',
            result,
          ),
        });
        this.closeSalesSummaryPreImplantationDialog();
      },
      error: () => {
        this.applyingSalesSummaryPreImplantation.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('common.errorMessage'),
        });
      },
    });
  }

  /** Abre o diálogo de análise: nunca grava nada, só mostra o que confirmApplyCreditOrderPreImplantation executaria. */
  protected openCreditOrderPreImplantationPreview(): void {
    if (this.previewingCreditOrderPreImplantation()) return;
    this.previewingCreditOrderPreImplantation.set(true);
    this.creditOrderApiService.previewLinkPreImplantation().subscribe({
      next: (preview) => {
        this.previewingCreditOrderPreImplantation.set(false);
        this.creditOrderPreImplantationPreview.set(preview);
        this.showCreditOrderPreImplantationDialog.set(true);
      },
      error: () => {
        this.previewingCreditOrderPreImplantation.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('common.errorMessage'),
        });
      },
    });
  }

  protected onCreditOrderPreImplantationDialogVisibleChange(visible: boolean): void {
    this.showCreditOrderPreImplantationDialog.set(visible);
    if (!visible) {
      this.creditOrderPreImplantationPreview.set(null);
    }
  }

  protected closeCreditOrderPreImplantationDialog(): void {
    this.showCreditOrderPreImplantationDialog.set(false);
    this.creditOrderPreImplantationPreview.set(null);
  }

  protected confirmApplyCreditOrderPreImplantation(): void {
    const preview = this.creditOrderPreImplantationPreview();
    this.confirmationService.confirm({
      message: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.creditOrderPreImplantationApplyConfirmMessage',
        { eligible: preview?.exactMatch ?? 0 },
      ),
      header: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.creditOrderPreImplantationApplyConfirmTitle',
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateSvc.instant(
        'conciliation.manualBankReconciliation.creditOrderPreImplantationApply',
      ),
      rejectLabel: this.translateSvc.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-warn',
      accept: () => this.doApplyCreditOrderPreImplantation(),
    });
  }

  private doApplyCreditOrderPreImplantation(): void {
    if (this.applyingCreditOrderPreImplantation()) return;
    this.applyingCreditOrderPreImplantation.set(true);
    this.creditOrderApiService.applyLinkPreImplantation().subscribe({
      next: (result: CreditOrderPreImplantationLinkingApplyResult) => {
        this.applyingCreditOrderPreImplantation.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.translateSvc.instant(
            'conciliation.manualBankReconciliation.creditOrderPreImplantationApplySuccess',
            result,
          ),
        });
        this.closeCreditOrderPreImplantationDialog();
      },
      error: () => {
        this.applyingCreditOrderPreImplantation.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.tUi('common.error'),
          detail: this.i18n.tUi('common.errorMessage'),
        });
      },
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

  statusEnumLabel(value: StatusEnum | null): string {
    return statusEnumLabel(value, this.i18n);
  }

  statusEnumSeverity(value: StatusEnum | null): CsTagTone {
    return statusEnumSeverity(value);
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

  refresh(): void {
    this.reloadReleases();
    this.reloadOrders();
  }

  private doReconcile(reason: string | null): void {
    this.facade.reconcile(reason).subscribe({
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
      this.lastReleasesEvent() ?? { first: 0, rows: this.releasesRows },
      this.releasesRows,
    );
    const query = buildListQuery<BankStatementAdvancedFilters>(
      tableQuery,
      this.buildReleasesAdvancedFilters(),
    );
    this.facade.loadReleases(query);
  }

  private reloadOrders(): void {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastOrdersEvent() ?? { first: 0, rows: this.ordersRows },
      this.ordersRows,
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

  /**
   * Banco/bandeira/empresa/adquirente aqui são sempre os valores dos próprios sinais
   * `order*` — ao selecionar um lançamento, `applyOrderDateRangeForSelection()` já os
   * preenche com os dados do lançamento (mesmo padrão do período/data), e o usuário pode
   * então sobrescrever manualmente qualquer um deles (mesmos controles do lado de
   * lançamentos bancários).
   */
  private buildOrdersAdvancedFilters(): Partial<CreditOrderAdvancedFilters> {
    return {
      releaseDate: this.orderReleaseDate() ?? undefined,
      periodReleaseDate: this.orderReleasePeriod() ?? undefined,

      releaseValueEnd: this.orderReleaseValueEnd() ?? undefined,
      releaseValueStart: this.orderReleaseValueStart() ?? undefined,

      statusPaymentBank: [StatusPaymentBankEnum.PENDING],
      banks: this.orderBanks()?.length ? this.orderBanks()! : undefined,
      flags: this.orderFlags()?.length ? this.orderFlags()! : undefined,
      companies: this.orderCompanies()?.length ? this.orderCompanies()! : undefined,
      acquirers: this.orderAcquirers()?.length ? this.orderAcquirers()! : undefined,
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
