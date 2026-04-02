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
import { UserMinimalModel } from '@models/user-minimal.models';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { PermissionService } from '@core/auth/permission.service';
import { BaseListPage } from '@shared/features/list-base/base-list-page';
import { CompanyAdvancedFilters } from '@features/filter/company.filters';
import { CompanyModel, CompanyFiltersState } from '@models/company.models';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { mapPrimeLazyToTableQuery } from '@shared/features/list-query/primeng-lazy.mapper';
import { CompanyPermissionPolicy } from '@features/security/policy/company-permission.policy';
import { FiltersPanelComponent } from '@shared/features/filters-panel/filters-panel.component';
import { CompanyCreateDialogComponent } from '../company-create/company-create-dialog.component';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import {
  TypeCompanyEnum,
  allTypeCompanyEnum,
  typeCompanySeverity,
  typeCompanyEnumLabel,
} from '@models/enums/type-company.enum';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
  normalizeStatusEnum,
} from '@models/enums/status.enum';

@Component({
  standalone: true,
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
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
    CompanyCreateDialogComponent,
  ],
})
export class CompanyListComponent extends BaseListPage<CompanyFiltersState> {
  @ViewChild('dt') private dt?: Table;

  readonly i18n = inject(I18nService);
  readonly facade = inject(CompanyFacade);
  readonly perms = inject(PermissionService);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(CompanyPermissionPolicy);

  private searchedOnce = false;
  private skipNextLazy = false;
  private lastLazyEvent: any | null = null;

  skeletonRows = Array.from({ length: 8 });
  rows = Number(localStorage.getItem('company.table.rows')) || 10;

  cnpj = signal('');
  fantasyName = signal('');
  socialReason = signal('');
  createdAtRange = signal<Date[] | null>(null);
  statusEnum = signal<StatusEnum[] | null>(null);
  createdBy = signal<UserMinimalModel | null>(null);
  typeCompanyEnum = signal<TypeCompanyEnum[] | null>(null);

  upsertVisible = signal(false);
  company = signal<CompanyModel | null>(null);

  selectedRows = signal<CompanyModel[]>([]);

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly typeCompanyEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeCompanyEnum().map((value) => ({
      label: typeCompanyEnumLabel(value, this.i18n),
      value,
    }));
  });

  companies = computed<CompanyModel[]>(() => this.facade.company() as CompanyModel[]);
  totalRecords = computed(() => this.facade.totalRecords());

  selectionStatus = computed<StatusEnum | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;

    return this.secPolicy.selectableStatus(selected[0]);
  });

  headerEligibleRows = computed(() => {
    const selectedStatus = this.selectionStatus();
    if (!selectedStatus) return [];

    return this.companies().filter((row) => this.secPolicy.canSelectForStatus(row, selectedStatus));
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

  selectedActiveRows = computed(() =>
    this.selectedRows().filter((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE),
  );

  selectedInactiveRows = computed(() =>
    this.selectedRows().filter((row) => normalizeStatusEnum(row.status) === StatusEnum.INACTIVE),
  );

  selectedBlockedRows = computed(() =>
    this.selectedRows().filter((row) => normalizeStatusEnum(row.status) === StatusEnum.BLOCKED),
  );

  canActivateSelected = computed(() => {
    const status = this.selectionStatus();
    return (
      (status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED) &&
      this.secPolicy.canActivateBulk(this.selectedRows())
    );
  });

  canDeactivateSelected = computed(() => {
    const status = this.selectionStatus();
    return status === StatusEnum.ACTIVE && this.secPolicy.canDeactivateBulk(this.selectedRows());
  });

  canBlockSelected = computed(() => {
    const status = this.selectionStatus();
    return status === StatusEnum.ACTIVE && this.secPolicy.canBlockBulk(this.selectedRows());
  });

  selectionModeLabel = computed(() => {
    const status = this.selectionStatus();

    if (status === StatusEnum.ACTIVE) {
      return this.i18n.tUi('enum.statusEnum.active');
    }

    if (status === StatusEnum.INACTIVE) {
      return this.i18n.tUi('enum.statusEnum.inactive');
    }

    if (status === StatusEnum.BLOCKED) {
      return this.i18n.tUi('enum.statusEnum.blocked');
    }

    return this.i18n.tUi('company.selection.mode.none');
  });

  activeFiltersCount = computed(() => {
    let c = 0;
    if (this.createdBy()) c++;

    if (this.cnpj().trim()) c++;
    if (this.statusEnum()?.length) c++;
    if (this.fantasyName().trim()) c++;
    if (this.socialReason().trim()) c++;
    if (this.typeCompanyEnum()?.length) c++;

    const create = this.createdAtRange();
    if (create?.[0] && create?.[1]) c++;

    return c;
  });

  activeFilters = computed(() => {
    const items: { label: string; value: string }[] = [];

    const cnpj = this.cnpj().trim();
    const createdBy = this.createdBy();
    const statusEnum = this.statusEnum();
    const fantasyName = this.fantasyName().trim();
    const typeCompanyEnum = this.typeCompanyEnum();
    const socialReason = this.socialReason().trim();

    const create = this.createdAtRange();

    if (socialReason) {
      items.push({ label: this.i18n.tUi('company.fields.socialReason'), value: socialReason });
    }

    if (createdBy) {
      items.push({ label: this.i18n.tUi('company.fields.createdBy'), value: createdBy.name });
    }

    if (fantasyName) {
      items.push({ label: this.i18n.tUi('company.fields.fantasyName'), value: fantasyName });
    }

    if (cnpj) {
      items.push({ label: this.i18n.tUi('company.fields.cnpj'), value: cnpj });
    }

    if (statusEnum?.length) {
      const labels = statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', ');
      items.push({ label: this.i18n.tUi('company.fields.statusEnum'), value: labels });
    }

    if (typeCompanyEnum?.length) {
      const labels = typeCompanyEnum.map((v) => typeCompanyEnumLabel(v, this.i18n)).join(', ');
      items.push({ label: this.i18n.tUi('company.fields.typeEnum'), value: labels });
    }

    if (create?.[0] && create?.[1]) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(d);

      items.push({
        label: this.i18n.tUi('company.fields.createdAt'),
        value: `${fmt(create[0])} – ${fmt(create[1])}`,
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
    localStorage.setItem('company.table.rows', this.rows.toString());
  }

  onSaved(): void {
    this.refresh();
  }

  isRowCheckboxDisabled(row: CompanyModel): boolean {
    if (this.isRowSelected(row)) return false;

    const currentStatus = this.selectionStatus();
    return !this.secPolicy.canSelectForStatus(row, currentStatus);
  }

  isRowSelected(row: CompanyModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: CompanyModel, checked: boolean): void {
    const current = this.selectedRows();

    if (!checked) {
      this.selectedRows.set(current.filter((item) => item.id !== row.id));
      return;
    }

    const rowStatus = this.secPolicy.selectableStatus(row);
    if (!rowStatus) return;

    if (!current.length) {
      this.selectedRows.set([row]);
      return;
    }

    const currentStatus = this.selectionStatus();
    if (rowStatus !== currentStatus) return;

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

  activate(row: CompanyModel): void {
    this.clearSelection();

    this.facade.activate(row.id).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('company.activate.successSingle'),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  deactivate(row: CompanyModel): void {
    this.clearSelection();

    this.facade.deactivate(row.id).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('company.deactivate.successSingle'),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  block(row: CompanyModel): void {
    this.clearSelection();

    this.facade.block(row.id).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('company.block.successSingle'),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  confirmActivate(row: CompanyModel): void {
    this.confirm.confirm({
      header: this.i18n.tUi('company.activate.header'),
      message: this.i18n.tUi('company.activate.messageSingle', {
        socialReason: row?.socialReason ?? row?.fantasyName ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: CompanyModel): void {
    this.confirm.confirm({
      header: this.i18n.tUi('company.deactivate.header'),
      message: this.i18n.tUi('company.deactivate.messageSingle', {
        socialReason: row?.socialReason ?? row?.fantasyName ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: CompanyModel): void {
    this.confirm.confirm({
      header: this.i18n.tUi('company.block.header'),
      message: this.i18n.tUi('company.block.messageSingle', {
        socialReason: row?.socialReason ?? row?.fantasyName ?? row?.id ?? '',
      }),
      icon: 'pi pi-lock',
      accept: () => this.block(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.clearSelection();

    this.facade.activateBulk(rows.map((row) => row.id)).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('company.activate.successBulk', { count: rows.length }),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.clearSelection();

    this.facade.deactivateBulk(rows.map((row) => row.id)).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('company.deactivate.successBulk', { count: rows.length }),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.clearSelection();

    this.facade.blockBulk(rows.map((row) => row.id)).subscribe({
      next: () => {
        this.clearSelection();
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('company.block.successBulk', { count: rows.length }),
        });
      },
      error: () => {
        this.clearSelection();
      },
    });
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.confirm.confirm({
      header: this.i18n.tUi('company.activate.header'),
      message: this.i18n.tUi('company.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.confirm.confirm({
      header: this.i18n.tUi('company.deactivate.header'),
      message: this.i18n.tUi('company.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.confirm.confirm({
      header: this.i18n.tUi('company.block.header'),
      message: this.i18n.tUi('company.block.messageBulk', { count: rows.length }),
      icon: 'pi pi-lock',
      accept: () => this.blockSelected(),
    });
  }

  typeCompanyEnumLabel(status: TypeCompanyEnum | null) {
    return typeCompanyEnumLabel(status, this.i18n);
  }

  severityTypeCompanyEnum(status: TypeCompanyEnum | null) {
    return typeCompanySeverity(status);
  }

  statusEnumLabel(status: StatusEnum | null) {
    return statusEnumLabel(status, this.i18n);
  }

  severityEnum(status: StatusEnum | null) {
    return statusEnumSeverity(status);
  }

  goNew() {
    this.company.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: CompanyModel) {
    this.company.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) {
      this.company.set(null);
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
    return 'cardsync.company.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<CompanyAdvancedFilters>(
      tableQuery as any,
      this.buildAdvancedFilters(),
    );

    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.cnpj.set('');
    this.fantasyName.set('');
    this.socialReason.set('');

    this.createdBy.set(null);
    this.statusEnum.set(null);
    this.createdAtRange.set(null);
    this.typeCompanyEnum.set(null);
  }

  protected override toFiltersState(): CompanyFiltersState {
    const create = this.createdAtRange();
    return {
      cnpj: this.cnpj(),
      fantasyName: this.fantasyName(),
      socialReason: this.socialReason(),
      createdBy: this.createdBy(),

      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
      typeEnum: this.typeCompanyEnum()?.length ? this.typeCompanyEnum() : null,

      createdAtRange:
        create?.[0] && create?.[1] ? [create[0].toISOString(), create[1].toISOString()] : null,
    };
  }

  protected override applyFiltersState(s: CompanyFiltersState): void {
    this.cnpj.set(s.cnpj ?? '');
    this.createdBy.set(s.createdBy ?? null);
    this.fantasyName.set(s.fantasyName ?? '');
    this.socialReason.set(s.socialReason ?? '');

    this.statusEnum.set(s.statusEnum ?? null);
    this.typeCompanyEnum.set(s.typeEnum ?? null);

    this.createdAtRange.set(
      s.createdAtRange?.[0] && s.createdAtRange?.[1]
        ? [new Date(s.createdAtRange[0]), new Date(s.createdAtRange[1])]
        : null,
    );
  }

  protected buildAdvancedFilters(): Partial<CompanyAdvancedFilters> {
    const create = this.createdAtRange();

    const [createFrom, createTo] =
      create?.[0] && create?.[1]
        ? [create[0].toISOString(), create[1].toISOString()]
        : [undefined, undefined];

    return {
      cnpj: this.cnpj().trim() || undefined,
      createdBy: this.createdBy() || null,
      fantasyName: this.fantasyName().trim() || undefined,
      socialReason: this.socialReason().trim() || undefined,

      statusEnum: this.statusEnum()?.length ? this.statusEnum() : undefined,
      typeEnum: this.typeCompanyEnum()?.length ? this.typeCompanyEnum() : undefined,

      createdAtTo: createTo,
      createdAtFrom: createFrom,
    };
  }

  protected reloadWithCurrentState() {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastLazyEvent ?? { first: 0, rows: this.rows },
      this.rows,
    );

    const query = buildListQuery<CompanyAdvancedFilters>(tableQuery, this.buildAdvancedFilters());

    this.rows = tableQuery.size;
    localStorage.setItem('company.table.rows', this.rows.toString());

    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }
}
