import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
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
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { ChargebackRequestModel } from '@models/chargeback-request.model';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { ChargebackRequestFacade } from '@features/facade/chargeback-request.facade';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
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
  ChargebackRequestFiltersState,
  ChargebackRequestAdvancedFilters,
  resetChargebackRequestAdvancedFilters,
  createEmptyChargebackRequestFiltersState,
} from '@features/filter/chargeback-request.filters';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  ChargebackRequestReasonEnum,
  allChargebackRequestReasonEnum,
  chargebackRequestReasonEnumLabel,
  chargebackRequestReasonEnumSeverity,
} from '@models/enums/chargeback-request-reason.enum';
import {
  ChargebackRequestStatusEnum,
  allChargebackRequestStatusEnum,
  chargebackRequestStatusEnumLabel,
  chargebackRequestStatusEnumSeverity,
} from '@models/enums/chargeback-request-status.enum';

/**
 * Lista paginada de solicitacoes de chargeback enviadas pela adquirente.
 *
 * Variante: Simples com 3 botoes de acao diretos por linha (alerta, visualizar, buscar).
 * Endpoint: POST /v1/chargeback-requests/search | /totals
 *
 * Filtros do painel (3 linhas):
 *   Linha 1 — Periodo/Data Venda · Periodo Request/Data Limite · CV/NSU · Autorizacao · Resumo Vendas · Numero Cartao
 *   Linha 2 — Adquirente · Bandeira · Modalidade · Estabelecimento · Empresa
 *   Linha 3 — Motivo do Request · Status do Request
 *
 * Colunas da tabela (13):
 *   Empresa · Venda · Data Limite · Estab. · ADQ · Modalidade · Resumo
 *   Bandeira · Bruto · Codigo (motivo) · CV/NSU · Status · Acoes
 */
@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-chargeback-request-list',
  templateUrl: './chargeback-request-list.component.html',
  imports: [
    CommonModule,
    Menu,
    Select,
    Tooltip,
    CsDatePipe,
    DatePicker,
    TableModule,
    MultiSelect,
    FormsModule,
    ButtonModule,
    CsCurrencyPipe,
    CsTagComponent,
    CsDocumentPipe,
    InputTextModule,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class ChargebackRequestListComponent
  extends StatefulListPage<ChargebackRequestFiltersState, ChargebackRequestAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly facade = inject(ChargebackRequestFacade);
  readonly router = inject(Router);
  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  /* Opcoes dos dropdowns de selecao */
  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly items = computed<ChargebackRequestModel[]>(
    () => this.facade.items() as ChargebackRequestModel[],
  );

  /* Restaura o tamanho de pagina da sessao anterior; cai no padrao se nao existir */
  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  /* Opcoes de enum reativas ao idioma — getAppliedLang() forca reavaliacao ao trocar lingua */
  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly requestReasonOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allChargebackRequestReasonEnum().map((value) => ({
      label: chargebackRequestReasonEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly adjustmentStatusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allChargebackRequestStatusEnum().map((value) => ({
      label: chargebackRequestStatusEnumLabel(value, this.i18n),
      value,
    }));
  });

  /* Filtros avancados — painel lateral, persistidos em localStorage via filtersKey() */

  readonly flags = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);

  readonly saleDate = signal<string | string[] | null>(null);
  readonly periodSaleDate = signal<PeriodEnum | null>(null);

  readonly deadline = signal<string | string[] | null>(null); // Data da Limite / Periodo Request
  readonly periodDeadline = signal<PeriodEnum | null>(null);

  readonly cvNsu = signal<string>('');
  readonly rvNumber = signal<string>('');
  readonly cardNumber = signal<string>('');
  readonly authorization = signal<string>('');

  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly requestReason = signal<ChargebackRequestReasonEnum[] | null>(null);
  readonly adjustmentStatus = signal<ChargebackRequestStatusEnum[] | null>(null);

  /* Datepicker so habilita quando o periodo esta selecionado */
  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isDeadlineDisabled = computed(() => !this.periodDeadline());

  /* Drafts colunas tabela — espelham os filtros inline da p-table, NAO persistidos separadamente.
     Inicializados em ngAfterViewInit via syncColumnDraftsFromTableState. */
  readonly cvNsuColumnDraft = signal<string>('');
  readonly authorizationColumnDraft = signal<string>('');
  readonly transactionValueColumnDraft = signal<string>('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);

  readonly saleDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly saleDateColumnDraft = signal<string | string[] | null>(null);

  readonly deadlineColumnPeriod = signal<PeriodEnum | null>(null);
  readonly deadlineColumnDraft = signal<string | string[] | null>(null);

  readonly modalityColumnDraft = signal<ModalityEnum[] | null>(null);
  readonly requestReasonColumnDraft = signal<ChargebackRequestReasonEnum[] | null>(null);
  readonly adjustmentStatusColumnDraft = signal<ChargebackRequestStatusEnum[] | null>(null);

  readonly isSaleDateColumnDisabled = computed(() => !this.saleDateColumnPeriod());
  readonly isDeadlineColumnDisabled = computed(() => !this.deadlineColumnPeriod());

  ngOnInit(): void {
    // Carrega opcoes dos filtros antes de initStatefulList, que pode restaurar
    // filtros salvos que dependem dessas listas para exibir os labels corretamente.
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();

    // Deve ser o ultimo — restaura estado da sessao anterior e dispara a primeira carga.
    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    // queueMicrotask garante que os filtros da p-table ja foram inicializados pelo stateStorage
    // antes de tentarmos le-los para popular os sinais de draft das colunas.
    queueMicrotask(() => this.syncColumnDraftsFromTableState());
  }

  /** Limpa todos os filtros, o estado da tabela e recarrega a primeira pagina. */
  clear(): void {
    const key = this.tableStateKey();
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();

    this.cvNsuColumnDraft.set('');
    this.authorizationColumnDraft.set('');
    this.transactionValueColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.saleDateColumnDraft.set(null);
    this.deadlineColumnDraft.set(null);
    this.modalityColumnDraft.set(null);
    this.saleDateColumnPeriod.set(null);
    this.deadlineColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);
    this.requestReasonColumnDraft.set(null);
    this.adjustmentStatusColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  /* Helpers de label/severity para o template */
  modalityLabel(value: ModalityEnum | null): string {
    return modalityEnumLabel(value, this.i18n);
  }
  modalitySeverity(value: ModalityEnum | null): CsTagTone {
    return modalityEnumSeverity(value);
  }

  requestReasonLabel(value: ChargebackRequestReasonEnum | null): string {
    return chargebackRequestReasonEnumLabel(value, this.i18n);
  }
  requestReasonSeverity(value: ChargebackRequestReasonEnum | null): CsTagTone {
    return chargebackRequestReasonEnumSeverity(value);
  }

  adjustmentStatusLabel(value: ChargebackRequestStatusEnum | null): string {
    return chargebackRequestStatusEnumLabel(value, this.i18n);
  }
  adjustmentStatusSeverity(value: ChargebackRequestStatusEnum | null): CsTagTone {
    return chargebackRequestStatusEnumSeverity(value);
  }

  /* Overrides obrigatorios do StatefulListPage */

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.CHARGEBACK_REQUESTS.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.CHARGEBACK_REQUESTS.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.CHARGEBACK_REQUESTS.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<ChargebackRequestAdvancedFilters>>,
  ): void {
    // Limpa totais anteriores para evitar exibir valores desatualizados durante a nova busca.
    this.facade.clearTotals();
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<ChargebackRequestAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetChargebackRequestAdvancedFilters(this);
  }

  /* Filtros avancados — chips exibidos no topo do painel quando ativos */
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const saleDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodSaleDate(),
      this.saleDate(),
      this.i18n,
    );
    if (saleDateValue) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.saleDate'),
        value: saleDateValue,
      });
    }

    const deadlineValue = this.formatActiveFilterPeriodDateValue(
      this.periodDeadline(),
      this.deadline(),
      this.i18n,
    );
    if (deadlineValue) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.deadline'),
        value: deadlineValue,
      });
    }

    const cvNsu = this.cvNsu();
    if (cvNsu) {
      items.push({ label: this.i18n.tUi('chargebackRequest.fields.cvNsu'), value: cvNsu });
    }

    const authorization = this.authorization();
    if (authorization) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.authorization'),
        value: authorization,
      });
    }

    const rvNumber = this.rvNumber();
    if (rvNumber) {
      items.push({ label: this.i18n.tUi('chargebackRequest.fields.rvNumber'), value: rvNumber });
    }

    const cardNumber = this.cardNumber();
    if (cardNumber) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.cardNumber'),
        value: cardNumber,
      });
    }

    const acquirer = this.acquirers();
    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('chargebackRequest.fields.acquirer'), value: labels });
    }

    const flag = this.flags();
    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');
      items.push({ label: this.i18n.tUi('chargebackRequest.fields.flag'), value: labels });
    }

    const modality = this.modality();
    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const company = this.companies();
    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('chargebackRequest.fields.company'), value: labels });
    }

    const establishment = this.establishments();
    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.establishment'),
        value: labels,
      });
    }

    const requestReason = this.requestReason();
    if (requestReason?.length) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.requestReason'),
        value: requestReason.map((v) => chargebackRequestReasonEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const adjustmentStatus = this.adjustmentStatus();
    if (adjustmentStatus?.length) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.adjustmentStatus'),
        value: adjustmentStatus
          .map((v) => chargebackRequestStatusEnumLabel(v, this.i18n))
          .join(', '),
      });
    }

    return items;
  });

  /**
   * Constroi o payload de filtros para o endpoint de busca.
   * Arrays vazios sao omitidos (undefined) — o backend ignora campos ausentes.
   * Strings vazias sao omitidas com `|| undefined` (falsy em JS).
   */
  protected override buildAdvancedFilters(): Partial<ChargebackRequestAdvancedFilters> {
    return {
      flags: this.flags()?.length ? this.flags()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      saleDate: this.saleDate() ?? undefined,
      periodSaleDate: this.periodSaleDate() ?? undefined,

      deadline: this.deadline() ?? undefined,
      periodDeadline: this.periodDeadline() ?? undefined,

      cvNsu: this.cvNsu() || undefined,
      authorization: this.authorization() || undefined,
      rvNumber: this.rvNumber() || undefined,
      cardNumber: this.cardNumber() || undefined,

      modality: this.modality()?.length ? this.modality()! : undefined,
      requestReason: this.requestReason()?.length ? this.requestReason()! : undefined,
      adjustmentStatus: this.adjustmentStatus()?.length ? this.adjustmentStatus()! : undefined,
    };
  }

  /**
   * Sincroniza os sinais de draft das colunas a partir do estado salvo pelo stateStorage da p-table.
   * Chamado em queueMicrotask para garantir que a tabela ja restaurou os filtros do localStorage.
   */
  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

    this.syncTextColumnDraftFromTableState(
      filters,
      'authorization',
      this.authorizationColumnDraft,
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
      'transactionValue',
      this.transactionValueColumnDraft,
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
    this.syncArrayColumnDraftFromTableState(
      filters,
      'establishment',
      this.establishmentColumnDraft,
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
      'requestReason',
      this.requestReasonColumnDraft,
      readArrayFilterValues,
    );
    this.syncArrayColumnDraftFromTableState(
      filters,
      'adjustmentStatus',
      this.adjustmentStatusColumnDraft,
      readArrayFilterValues,
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
      'deadline',
      this.deadlineColumnPeriod,
      this.deadlineColumnDraft,
      readPeriodFilterValue,
    );
  }

  /**
   * Converte os filtros inline da p-table em chips de filtro ativo.
   * getAppliedLang() garante que os labels reavaliam ao trocar idioma.
   */
  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const flags = readArrayFilterValues(filters, 'flag');
    if (flags.length) {
      const labels = this.flagsOptions()
        .filter((o) => flags.includes(o.id))
        .map((o) => o.name);
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((o) => acquirers.includes(o.id))
        .map((o) => o.fantasyName);
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((o) => companies.includes(o.id))
        .map((o) => o.fantasyName);
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((o) => establishments.includes(o.id))
        .map((o) => o.pvNumber);
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.modality'),
        value: modalities.map((v) => modalityEnumLabel(v as ModalityEnum, this.i18n)).join(', '),
      });
    }

    const reasons = readArrayFilterValues(filters, 'requestReason');
    if (reasons.length) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.requestReason'),
        value: reasons
          .map((v) => chargebackRequestReasonEnumLabel(v as ChargebackRequestReasonEnum, this.i18n))
          .join(', '),
      });
    }

    const statuses = readArrayFilterValues(filters, 'adjustmentStatus');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('chargebackRequest.fields.adjustmentStatus'),
        value: statuses
          .map((v) => chargebackRequestStatusEnumLabel(v as ChargebackRequestStatusEnum, this.i18n))
          .join(', '),
      });
    }

    return items;
  }

  protected override toFiltersState(): ChargebackRequestFiltersState {
    return {
      flags: this.flags(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      saleDate: this.saleDate(),
      periodSaleDate: this.periodSaleDate(),

      deadline: this.deadline(),
      periodDeadline: this.periodDeadline(),

      cvNsu: this.cvNsu(),
      authorization: this.authorization(),
      rvNumber: this.rvNumber(),
      cardNumber: this.cardNumber(),

      modality: this.modality(),
      requestReason: this.requestReason(),
      adjustmentStatus: this.adjustmentStatus(),
    };
  }

  protected override applyFiltersState(s: ChargebackRequestFiltersState): void {
    this.flags.set(s.flags ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate ?? null);

    this.deadline.set(s.deadline ?? null);
    this.periodDeadline.set(s.periodDeadline ?? null);

    this.cvNsu.set(s.cvNsu ?? '');
    this.authorization.set(s.authorization ?? '');
    this.rvNumber.set(s.rvNumber ?? '');
    this.cardNumber.set(s.cardNumber ?? '');

    this.modality.set(s.modality ?? null);
    this.requestReason.set(s.requestReason ?? null);
    this.adjustmentStatus.set(s.adjustmentStatus ?? null);
  }

  /* Acoes de linha */
  /**
   * Navega para o Resumo de Vendas pre-filtrando pela empresa/estabelecimento/adquirente/bandeira.
   * O filtro e gravado no localStorage da tela destino antes de abrir.
   */
  /** Retorna as opções do menu de busca da linha (ícone de lupa na tabela). */
  protected searchActions(row: ChargebackRequestModel): MenuItem[] {
    return [
      {
        label: this.i18n.tUi('common.search.salesSummary'),
        icon: 'pi pi-search',
        command: () => this.searchOnSalesSummary(row),
      },
    ];
  }

  /**
   * Navega para o Resumo de Vendas pré-filtrando pela empresa/estabelecimento/adquirente/bandeira
   * do registro selecionado. O filtro é gravado no localStorage da tela destino antes de abrir.
   */
  protected searchOnSalesSummary(row: ChargebackRequestModel): void {
    const targetFilters = {
      ...createEmptyChargebackRequestFiltersState(),
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

  /** Abre uma rota em nova aba sem recarregar a pagina atual. */
  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }
}
