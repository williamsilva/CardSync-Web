import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';

import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { FiltersPanelComponent } from '@shared/features/filters-panel/filters-panel.component';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import { BaseListPage } from '@shared/features/list-base/base-list-page';
import { I18nService } from '@core/i18n/i18n.service';
import { UsersFacade } from '@features/facade/users.facade';
import { UsersAdvancedFilters } from '@features/filter/users.filters';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { mapPrimeLazyToTableQuery } from '@shared/features/list-query/primeng-lazy.mapper';

export interface UserRow {
  id: string;
  name: string;
  status: string;
  userName: string;
  document: string;
  lastLoginAt?: string | null;
  blockedUntil?: string | null;
  passwordChangedAt?: string | null;
  passwordExpiresAt?: string | null;
}

type UsersFiltersState = {
  name: string;
  userName: string;
  document: string;
  status: string[] | null;
  passwordChangedAtRange: [string, string] | null;
};

@Component({
  standalone: true,
  selector: 'app-companies-list',
  templateUrl: './companies-list.component.html',
  imports: [
    CommonModule,
    TagModule,
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    PanelModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    SkeletonModule,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    FiltersPanelComponent,
    DATA_TABLE_SHELL_IMPORTS,
  ],
})
export class CompaniesListComponent extends BaseListPage<UsersFiltersState> {
  @ViewChild('dt') private dt?: Table;

  readonly i18n = inject(I18nService);
  readonly facade = inject(UsersFacade);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmationService);

  private searchedOnce = false;
  private lastLazyEvent: any | null = null;

  // evita duplicar chamada (ngOnInit faz a primeira busca; o p-table dispara onLazyLoad logo em seguida)
  private skipNextLazy = false;

  ngOnInit() {
    this.loadOnInit(); // restaura filtros avançados salvos (signals)

    const hasAdvanced = this.activeFiltersCount() > 0;

    // ✅ se já tem filtro salvo, consideramos "pesquisado"
    if (hasAdvanced) {
      this.searchedOnce = true;
    }

    // ✅ sempre faz a primeira busca (com filtros avançados restaurados)
    // e evita depender do onLazyLoad no bootstrap
    this.skipNextLazy = true;
    this.lastLazyEvent = { first: 0, rows: this.rows, filters: undefined, globalFilter: null };
    this.reloadWithCurrentState();
  }

  skeletonRows = Array.from({ length: 8 });
  rows = Number(localStorage.getItem('users.table.rows')) || 10;

  // ======= FILTERS (painel avançado) =======
  name = signal('');
  userName = signal('');
  document = signal('');
  status = signal<string[] | null>(null);
  passwordChangedAtRange = signal<Date[] | null>(null);

  statusOptions = computed(() => [
    { label: this.i18n.tUi('users.status.active'), value: 'ACTIVE' },
    { label: this.i18n.tUi('users.status.inactive'), value: 'INACTIVE' },
    { label: this.i18n.tUi('users.status.blocked'), value: 'BLOCKED' },
    { label: this.i18n.tUi('users.status.disabled'), value: 'DISABLED' },
    { label: this.i18n.tUi('users.status.pending_password'), value: 'PENDING_PASSWORD' },
  ]);

  // ======= DATA =======
  users = computed<UserRow[]>(() => this.facade.users() as any);
  totalRecords = computed(() => this.facade.totalRecords());

  // ======= UI helpers =======
  activeFiltersCount = computed(() => {
    let c = 0;
    if (this.name().trim()) c++;
    if (this.userName().trim()) c++;
    if (this.document().trim()) c++;
    if (this.status()?.length) c++;
    const r = this.passwordChangedAtRange();
    if (r?.[0] && r?.[1]) c++;
    return c;
  });

  activeFilters = computed(() => {
    const items: { label: string; value: string }[] = [];

    const statuses = this.status();
    const name = this.name().trim();
    const userName = this.userName().trim();
    const document = this.document().trim();
    const range = this.passwordChangedAtRange();

    if (name) items.push({ label: this.i18n.tUi('users.fields.name'), value: name });
    if (userName) items.push({ label: this.i18n.tUi('users.fields.userName'), value: userName });
    if (document) items.push({ label: this.i18n.tUi('users.fields.document'), value: document });

    if (statuses?.length) {
      const options = this.statusOptions();
      const labels = statuses
        .map((v) => options.find((o) => o.value === v)?.label ?? String(v))
        .join(', ');
      items.push({ label: this.i18n.tUi('users.fields.status'), value: labels });
    }

    if (range?.[0] && range?.[1]) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(d);

      items.push({
        label: this.i18n.tUi('users.fields.passwordChangedAt'),
        value: `${fmt(range[0])} – ${fmt(range[1])}`,
      });
    }

    return items;
  });

  // ===== BaseListPage contract =====
  protected override filtersKey(): string {
    return 'cardsync.companies.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    // sem lazy event ainda => tableQuery padrão
    const tableQuery = { page: 0, size: this.rows };

    const query = buildListQuery<UsersAdvancedFilters>(
      tableQuery as any,
      this.buildAdvancedFilters(),
    );

    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.name.set('');
    this.userName.set('');
    this.document.set('');
    this.status.set(null);
    this.passwordChangedAtRange.set(null);
  }

  protected override toFiltersState(): UsersFiltersState {
    const range = this.passwordChangedAtRange();
    return {
      name: this.name(),
      userName: this.userName(),
      document: this.document(),
      status: this.status()?.length ? this.status() : null,
      passwordChangedAtRange:
        range?.[0] && range?.[1] ? [range[0].toISOString(), range[1].toISOString()] : null,
    };
  }

  protected override applyFiltersState(s: UsersFiltersState): void {
    this.name.set(s.name ?? '');
    this.userName.set(s.userName ?? '');
    this.document.set(s.document ?? '');
    this.status.set(s.status ?? null);

    if (s.passwordChangedAtRange?.[0] && s.passwordChangedAtRange?.[1]) {
      this.passwordChangedAtRange.set([
        new Date(s.passwordChangedAtRange[0]),
        new Date(s.passwordChangedAtRange[1]),
      ]);
    } else {
      this.passwordChangedAtRange.set(null);
    }
  }

  // ===== UI actions =====
  search() {
    this.persistFilters();
    this.searchedOnce = true;

    // ao clicar buscar, volta para primeira página mantendo filtros de coluna (se existirem)
    if (this.lastLazyEvent) {
      this.lastLazyEvent = { ...this.lastLazyEvent, first: 0 };
    }

    this.reloadWithCurrentState();
  }

  clear() {
    // 1) limpa filtros avançados + storage (BaseListPage)
    this.clearAndPersist();
    this.searchedOnce = true;

    // 2) limpa UI e estado interno da tabela (colunas + global)
    this.dt?.clear();

    // 3) limpa o que vai pro backend via lazy event
    this.lastLazyEvent = {
      first: 0,
      rows: this.rows,
      filters: undefined,
      globalFilter: null,
      sortField: undefined,
      sortOrder: undefined,
      multiSortMeta: undefined,
    };

    // 4) recarrega primeira página sem filtros
    this.reloadWithCurrentState();
  }

  onPageChange(event: any) {
    this.rows = event.rows;
    localStorage.setItem('users.table.rows', this.rows.toString());
  }

  /** ✅ monta advanced filters do painel */
  private buildAdvancedFilters(): Partial<UsersAdvancedFilters> {
    const range = this.passwordChangedAtRange();

    const [from, to] =
      range?.[0] && range?.[1]
        ? [range[0].toISOString(), range[1].toISOString()]
        : [undefined, undefined];

    return {
      name: this.name().trim() || undefined,
      userName: this.userName().trim() || undefined,
      document: this.document().trim() || undefined,
      //status: this.status()?.length ? this.status() : undefined,
      //passwordChangedAtFrom: from,
      //passwordChangedAtTo: to,
    };
  }

  private reloadWithCurrentState() {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastLazyEvent ?? { first: 0, rows: this.rows },
      this.rows,
    );
    const query = buildListQuery<UsersAdvancedFilters>(tableQuery, this.buildAdvancedFilters());

    this.rows = tableQuery.size;
    localStorage.setItem('users.table.rows', this.rows.toString());

    this.facade.loadPage(query);
  }

  goNew() {
    this.router.navigate(['/companies/new']);
  }

  edit(id: string) {
    this.router.navigate(['/companies', id]);
  }

  confirmDelete(id: string, userName: string) {
    /* const header = this.i18n.tUi('users.delete.header');
    const message = this.i18n
      .tUi('users.delete.message', undefined)
      .replace('{userName}', userName);

    this.confirm.confirm({
      header,
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.tUi('common.delete'),
      rejectLabel: this.i18n.tUi('common.cancel'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.facade.delete(id).subscribe(),
    });*/
  }

  statusLabel(status: number) {
    return status === 1
      ? this.i18n.tUi('users.status.active')
      : this.i18n.tUi('users.status.inactive');
  }

  severity(status: number) {
    return status === 1 ? 'success' : 'danger';
  }

  onLazyLoad(e: any) {
    this.lastLazyEvent = e;

    // ✅ evita chamada duplicada logo após o ngOnInit
    if (this.skipNextLazy) {
      this.skipNextLazy = false;
      return;
    }

    // Mantém sua regra: se tem filtro avançado e ainda não clicou buscar, não dispara
    // MAS: se o evento veio da tabela (filtros/sort), deve disparar.
    const hasTableInteraction =
      !!e?.filters ||
      e?.sortField != null ||
      (Array.isArray(e?.multiSortMeta) && e.multiSortMeta.length > 0) ||
      e?.globalFilter != null;

    if (!this.searchedOnce && this.activeFiltersCount() > 0 && !hasTableInteraction) {
      return;
    }

    this.reloadWithCurrentState();
  }
}
