import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { onlyDigits } from '@shared/utils/document.utils';
import { UsersFacade } from '@features/facade/users.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { PermissionService } from '@core/auth/permission.service';
import { UserModel, UsersFiltersState } from '@models/users.models';
import { UsersAdvancedFilters } from '@features/filter/users.filters';
import { BaseListPage } from '@shared/features/list-base/base-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { mapPrimeLazyToTableQuery } from '@shared/features/list-query/primeng-lazy.mapper';
import { FiltersPanelComponent } from '@shared/features/filters-panel/filters-panel.component';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import { UsersCreateDialogComponent } from '@features/security/users/users-create/users-create-dialog.component';
import {
  UserStatus,
  userStatusLabel,
  allUserStatuses,
  userStatusSeverity,
} from '@models/enums/user-status.enum';
import {
  BulkUserActionMode,
  SecurityPermissionPolicy,
} from '@features/security/policy/security-permission.policy';

@Component({
  standalone: true,
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  imports: [
    CommonModule,
    TagModule,
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    PanelModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CheckboxModule,
    CsDocumentPipe,
    SkeletonModule,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    CpfCnpjMaskDirective,
    FiltersPanelComponent,
    DATA_TABLE_SHELL_IMPORTS,
    UsersCreateDialogComponent,
  ],
})
export class UsersListComponent extends BaseListPage<UsersFiltersState> {
  @ViewChild('dt') private dt?: Table;

  readonly i18n = inject(I18nService);
  readonly facade = inject(UsersFacade);
  readonly perms = inject(PermissionService);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(SecurityPermissionPolicy);

  private searchedOnce = false;
  private skipNextLazy = false;
  private lastLazyEvent: any | null = null;

  skeletonRows = Array.from({ length: 8 });
  rows = Number(localStorage.getItem('users.table.rows')) || 10;

  name = signal('');
  userName = signal('');
  document = signal('');
  status = signal<UserStatus[] | null>(null);
  createdAtRange = signal<Date[] | null>(null);
  lastLoginAtRange = signal<Date[] | null>(null);
  blockedUntilRange = signal<Date[] | null>(null);
  passwordExpiresAtRange = signal<Date[] | null>(null);

  upsertVisible = signal(false);
  user = signal<UserModel | null>(null);

  selectedRows = signal<UserModel[]>([]);

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allUserStatuses().map((value) => ({
      label: userStatusLabel(value, this.i18n),
      value,
    }));
  });

  users = computed<UserModel[]>(() => this.facade.users() as UserModel[]);
  totalRecords = computed(() => this.facade.totalRecords());

  selectionMode = computed<BulkUserActionMode | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;
    return this.secPolicy.modeForRow(selected[0]);
  });

  headerEligibleRows = computed(() => {
    const mode = this.selectionMode();
    if (!mode) return [];
    return this.users().filter((row) => this.secPolicy.modeForRow(row) === mode);
  });

  headerChecked = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;
    return eligible.every((row) => this.isRowSelected(row));
  });

  headerIndeterminate = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;

    const selectedCount = eligible.filter((row) => this.isRowSelected(row)).length;
    return selectedCount > 0 && selectedCount < eligible.length;
  });

  selectedActivatableRows = computed(() =>
    this.selectedRows().filter((row) => this.secPolicy.modeForRow(row) === 'activate'),
  );

  selectedDeactivatableRows = computed(() =>
    this.selectedRows().filter((row) => this.secPolicy.modeForRow(row) === 'deactivate'),
  );

  canActivateSelected = computed(
    () =>
      this.selectionMode() === 'activate' &&
      this.secPolicy.canActivateBulk(this.selectedActivatableRows()),
  );

  canDeactivateSelected = computed(
    () =>
      this.selectionMode() === 'deactivate' &&
      this.secPolicy.canDeactivateBulk(this.selectedDeactivatableRows()),
  );

  selectionModeLabel = computed(() => {
    const mode = this.selectionMode();
    if (mode === 'activate') return this.i18n.tUi('users.selection.mode.activate');
    if (mode === 'deactivate') return this.i18n.tUi('users.selection.mode.deactivate');
    return this.i18n.tUi('users.selection.mode.none');
  });

  activeFiltersCount = computed(() => {
    let c = 0;
    if (this.name().trim()) c++;
    if (this.status()?.length) c++;
    if (this.userName().trim()) c++;
    if (this.document().trim()) c++;

    const create = this.createdAtRange();
    if (create?.[0] && create?.[1]) c++;

    const last = this.lastLoginAtRange();
    if (last?.[0] && last?.[1]) c++;

    const blocked = this.blockedUntilRange();
    if (blocked?.[0] && blocked?.[1]) c++;

    const expires = this.passwordExpiresAtRange();
    if (expires?.[0] && expires?.[1]) c++;

    return c;
  });

  activeFilters = computed(() => {
    const items: { label: string; value: string }[] = [];

    const statuses = this.status();
    const name = this.name().trim();
    const userName = this.userName().trim();
    const document = this.document().trim();

    const create = this.createdAtRange();
    const last = this.lastLoginAtRange();
    const blocked = this.blockedUntilRange();
    const expires = this.passwordExpiresAtRange();

    if (name) items.push({ label: this.i18n.tUi('users.fields.name'), value: name });
    if (userName) items.push({ label: this.i18n.tUi('users.fields.userName'), value: userName });
    if (document) items.push({ label: this.i18n.tUi('users.fields.document'), value: document });

    if (statuses?.length) {
      const labels = statuses.map((v) => userStatusLabel(v, this.i18n)).join(', ');
      items.push({ label: this.i18n.tUi('users.fields.status'), value: labels });
    }

    if (create?.[0] && create?.[1]) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(d);

      items.push({
        label: this.i18n.tUi('users.fields.createdAt'),
        value: `${fmt(create[0])} – ${fmt(create[1])}`,
      });
    }

    if (last?.[0] && last?.[1]) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(d);

      items.push({
        label: this.i18n.tUi('users.fields.lastLoginAt'),
        value: `${fmt(last[0])} – ${fmt(last[1])}`,
      });
    }

    if (blocked?.[0] && blocked?.[1]) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(d);

      items.push({
        label: this.i18n.tUi('users.fields.blockedUntil'),
        value: `${fmt(blocked[0])} – ${fmt(blocked[1])}`,
      });
    }

    if (expires?.[0] && expires?.[1]) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(d);

      items.push({
        label: this.i18n.tUi('users.fields.passwordExpiresAt'),
        value: `${fmt(expires[0])} – ${fmt(expires[1])}`,
      });
    }

    return items;
  });

  ngOnInit() {
    this.loadOnInit();

    const hasAdvanced = this.activeFiltersCount() > 0;
    if (hasAdvanced) {
      this.searchedOnce = true;
    }

    this.skipNextLazy = true;
    this.lastLazyEvent = { first: 0, rows: this.rows, filters: undefined, globalFilter: null };
    this.reloadWithCurrentState();
  }

  search() {
    this.persistFilters();
    this.searchedOnce = true;

    if (this.lastLazyEvent) {
      this.lastLazyEvent = { ...this.lastLazyEvent, first: 0 };
    }

    this.reloadWithCurrentState();
  }

  clear() {
    this.clearAndPersist();
    this.searchedOnce = true;
    this.clearSelection();
    this.dt?.clear();

    this.lastLazyEvent = {
      first: 0,
      rows: this.rows,
      filters: undefined,
      globalFilter: null,
      sortField: undefined,
      sortOrder: undefined,
      multiSortMeta: undefined,
    };

    this.reloadWithCurrentState();
  }

  onPageChange(event: any) {
    this.rows = event.rows;
    localStorage.setItem('users.table.rows', this.rows.toString());
  }

  onSaved(): void {
    this.refresh();
  }

  isRowCheckboxDisabled(row: UserModel): boolean {
    if (this.isRowSelected(row)) return false;

    const rowMode = this.secPolicy.modeForRow(row);
    const currentMode = this.selectionMode();

    if (!currentMode) {
      return rowMode === null;
    }

    return rowMode !== currentMode;
  }

  isRowSelected(row: UserModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: UserModel, checked: boolean): void {
    const current = this.selectedRows();

    if (!checked) {
      this.selectedRows.set(current.filter((item) => item.id !== row.id));
      return;
    }

    const rowMode = this.secPolicy.modeForRow(row);
    if (!rowMode) return;

    if (!current.length) {
      this.selectedRows.set([row]);
      return;
    }

    const currentMode = this.selectionMode();
    if (rowMode !== currentMode) return;

    if (this.isRowSelected(row)) return;

    this.selectedRows.set([...current, row]);
  }

  toggleHeaderSelection(checked: boolean): void {
    const eligible = this.headerEligibleRows();

    if (!eligible.length) return;

    if (!checked) {
      this.clearSelection();
      return;
    }

    this.selectedRows.set([...eligible]);
  }

  activate(row: UserModel): void {
    this.clearSelection();

    this.facade.activate(row.id).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('users.activate.successSingle'),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  deactivate(row: UserModel): void {
    this.clearSelection();

    this.facade.deactivate(row.id).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('users.deactivate.successSingle'),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  confirmActivate(row: UserModel): void {
    this.confirm.confirm({
      header: this.i18n.tUi('users.activate.header'),
      message: this.i18n.tUi('users.activate.messageSingle', {
        userName: row?.name ?? row?.userName ?? row?.id ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: UserModel): void {
    this.confirm.confirm({
      header: this.i18n.tUi('users.deactivate.header'),
      message: this.i18n.tUi('users.deactivate.messageSingle', {
        userName: row?.name ?? row?.userName ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedActivatableRows();
    if (!rows.length) return;

    this.clearSelection();

    this.facade.activateBulk(rows.map((row) => row.id)).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('users.activate.successBulk', { count: rows.length }),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  deactivateSelected(): void {
    const rows = this.selectedDeactivatableRows();
    if (!rows.length) return;

    this.clearSelection();

    this.facade.deactivateBulk(rows.map((row) => row.id)).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('users.deactivate.successBulk', { count: rows.length }),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  confirmActivateSelected(): void {
    const rows = this.selectedActivatableRows();
    if (!rows.length) return;

    this.confirm.confirm({
      header: this.i18n.tUi('users.activate.header'),
      message: this.i18n.tUi('users.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedDeactivatableRows();
    if (!rows.length) return;

    this.confirm.confirm({
      header: this.i18n.tUi('users.deactivate.header'),
      message: this.i18n.tUi('users.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  statusLabel(status: UserStatus | null) {
    return userStatusLabel(status, this.i18n);
  }

  severity(status: UserStatus | null) {
    return userStatusSeverity(status);
  }

  goNew() {
    this.user.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: UserModel) {
    this.user.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) {
      this.user.set(null);
    }
  }

  onCreated() {
    this.reloadWithCurrentState();
  }

  onLazyLoad(e: any) {
    this.lastLazyEvent = e;

    if (this.skipNextLazy) {
      this.skipNextLazy = false;
      return;
    }

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

  protected override filtersKey(): string {
    return 'cardsync.users.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<UsersAdvancedFilters>(
      tableQuery as any,
      this.buildAdvancedFilters(),
    );

    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.name.set('');
    this.userName.set('');
    this.document.set('');
    this.status.set(null);
    this.createdAtRange.set(null);
    this.lastLoginAtRange.set(null);
    this.blockedUntilRange.set(null);
    this.passwordExpiresAtRange.set(null);
  }

  protected override toFiltersState(): UsersFiltersState {
    const create = this.createdAtRange();
    const last = this.lastLoginAtRange();
    const blocked = this.blockedUntilRange();
    const expires = this.passwordExpiresAtRange();

    return {
      name: this.name(),
      userName: this.userName(),
      document: this.document(),
      status: this.status()?.length ? this.status() : null,
      lastLoginAtRange:
        last?.[0] && last?.[1] ? [last[0].toISOString(), last[1].toISOString()] : null,
      createdAtRange:
        create?.[0] && create?.[1] ? [create[0].toISOString(), create[1].toISOString()] : null,
      blockedUntilRange:
        blocked?.[0] && blocked?.[1] ? [blocked[0].toISOString(), blocked[1].toISOString()] : null,
      passwordExpiresAtRange:
        expires?.[0] && expires?.[1] ? [expires[0].toISOString(), expires[1].toISOString()] : null,
    };
  }

  protected override applyFiltersState(s: UsersFiltersState): void {
    this.name.set(s.name ?? '');
    this.status.set(s.status ?? null);
    this.userName.set(s.userName ?? '');
    this.document.set(s.document ?? '');

    this.lastLoginAtRange.set(
      s.lastLoginAtRange?.[0] && s.lastLoginAtRange?.[1]
        ? [new Date(s.lastLoginAtRange[0]), new Date(s.lastLoginAtRange[1])]
        : null,
    );

    this.createdAtRange.set(
      s.createdAtRange?.[0] && s.createdAtRange?.[1]
        ? [new Date(s.createdAtRange[0]), new Date(s.createdAtRange[1])]
        : null,
    );

    this.blockedUntilRange.set(
      s.blockedUntilRange?.[0] && s.blockedUntilRange?.[1]
        ? [new Date(s.blockedUntilRange[0]), new Date(s.blockedUntilRange[1])]
        : null,
    );

    this.passwordExpiresAtRange.set(
      s.passwordExpiresAtRange?.[0] && s.passwordExpiresAtRange?.[1]
        ? [new Date(s.passwordExpiresAtRange[0]), new Date(s.passwordExpiresAtRange[1])]
        : null,
    );
  }

  protected buildAdvancedFilters(): Partial<UsersAdvancedFilters> {
    const create = this.createdAtRange();
    const last = this.lastLoginAtRange();
    const blocked = this.blockedUntilRange();
    const expires = this.passwordExpiresAtRange();

    const [lastFrom, lastTo] =
      last?.[0] && last?.[1]
        ? [last[0].toISOString(), last[1].toISOString()]
        : [undefined, undefined];

    const [createFrom, createTo] =
      create?.[0] && create?.[1]
        ? [create[0].toISOString(), create[1].toISOString()]
        : [undefined, undefined];

    const [blockedFrom, blockedTo] =
      blocked?.[0] && blocked?.[1]
        ? [blocked[0].toISOString(), blocked[1].toISOString()]
        : [undefined, undefined];

    const [expiresFrom, expiresTo] =
      expires?.[0] && expires?.[1]
        ? [expires[0].toISOString(), expires[1].toISOString()]
        : [undefined, undefined];

    return {
      name: this.name().trim() || undefined,
      userName: this.userName().trim() || undefined,
      document: onlyDigits(this.document()) || undefined,
      status: this.status()?.length ? this.status() : undefined,
      lastLoginAtTo: lastTo,
      lastLoginAtFrom: lastFrom,
      createdAtTo: createTo,
      createdAtFrom: createFrom,
      blockedUntilTo: blockedTo,
      blockedUntilFrom: blockedFrom,
      passwordExpiresAtTo: expiresTo,
      passwordExpiresAtFrom: expiresFrom,
    };
  }

  protected reloadWithCurrentState() {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastLazyEvent ?? { first: 0, rows: this.rows },
      this.rows,
    );

    const query = buildListQuery<UsersAdvancedFilters>(tableQuery, this.buildAdvancedFilters());

    this.rows = tableQuery.size;
    localStorage.setItem('users.table.rows', this.rows.toString());

    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }
}
