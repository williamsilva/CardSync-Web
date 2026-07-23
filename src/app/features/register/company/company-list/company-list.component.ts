import { FormsModule } from '@angular/forms';

import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
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

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { UsersFacade } from '@features/facade/users.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { PermissionService } from '@core/auth/permission.service';
import { CompanyAdvancedFilters } from '@features/filter/company.filters';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { CompanyModel, CompanyFiltersState } from '@models/company.models';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CompanyPermissionPolicy } from '@features/security/policy/company-permission.policy';
import { CompanyCreateDialogComponent } from '../company-create/company-create-dialog.component';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';

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
import {
  readArrayFilterValues,
  readSingleFilterValue,
  readDateRangeFilterValue,
} from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  imports: [
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
    CsTagComponent,
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
export class CompanyListComponent extends StatefulListPage<
  CompanyFiltersState,
  CompanyAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(CompanyFacade);
  readonly userFacade = inject(UsersFacade);
  readonly perms = inject(PermissionService);
  readonly usersOptions = this.userFacade.options;
  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(CompanyPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: CompanyListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  skeletonRows = Array.from({ length: 8 });

  cnpj = signal('');
  fantasyName = signal('');
  socialReason = signal('');
  createdBy = signal<string[] | null>(null);
  createdAtRange = signal<Date[] | null>(null);
  statusEnum = signal<StatusEnum[] | null>(null);
  typeCompanyEnum = signal<TypeCompanyEnum[] | null>(null);

  upsertVisible = signal(false);
  selectedRows = signal<CompanyModel[]>([]);
  company = signal<CompanyModel | null>(null);
  totalRecords = computed(() => this.facade.totalRecords());
  companies = computed<CompanyModel[]>(() => this.facade.company() as CompanyModel[]);

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

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

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

    if (fantasyName) {
      items.push({ label: this.i18n.tUi('company.fields.fantasyName'), value: fantasyName });
    }

    if (cnpj) {
      items.push({ label: this.i18n.tUi('company.fields.cnpj'), value: cnpj });
    }

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('company.fields.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (typeCompanyEnum?.length) {
      items.push({
        label: this.i18n.tUi('company.fields.typeCompanyEnum'),
        value: typeCompanyEnum.map((v) => typeCompanyEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (create?.[0] && create?.[1]) {
      items.push({
        label: this.i18n.tUi('company.fields.createdAt'),
        value: `${this.formatDate(create[0])} – ${this.formatDate(create[1])}`,
      });
    }

    if (createdBy?.length) {
      const labels = this.usersOptions()
        .filter((opt) => createdBy.includes(opt.value))
        .map((opt) => opt.label)
        .join(', ');

      items.push({
        label: this.i18n.tUi('company.fields.createdBy'),
        value: labels,
      });
    }

    return items;
  });

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
    if (status === StatusEnum.ACTIVE) return this.i18n.tUi('enum.statusEnum.active');
    if (status === StatusEnum.INACTIVE) return this.i18n.tUi('enum.statusEnum.inactive');
    if (status === StatusEnum.BLOCKED) return this.i18n.tUi('enum.statusEnum.blocked');
    return this.i18n.tUi('company.selection.mode.none');
  });

  ngOnInit() {
    this.userFacade.loadUsersOptionsFilter();
    this.initStatefulList();
  }

  clear() {
    this.clearTableAndReload(this.dt);
  }

  onSaved(): void {
    this.refresh();
  }

  isRowCheckboxDisabled(row: CompanyModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForStatus(row, this.selectionStatus());
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

    if (rowStatus !== this.selectionStatus()) return;
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
    this.bulk.executeAction(
      this.facade.activate(row.id),
      this.i18n.tUi('company.activate.successSingle'),
    );
  }

  deactivate(row: CompanyModel): void {
    this.bulk.executeAction(
      this.facade.deactivate(row.id),
      this.i18n.tUi('company.deactivate.successSingle'),
    );
  }

  block(row: CompanyModel): void {
    this.bulk.executeAction(
      this.facade.block(row.id),
      this.i18n.tUi('company.block.successSingle'),
    );
  }

  confirmActivate(row: CompanyModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('company.activate.header'),
      message: this.i18n.tUi('company.activate.messageSingle', {
        socialReason: row?.socialReason ?? row?.fantasyName ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: CompanyModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('company.deactivate.header'),
      message: this.i18n.tUi('company.deactivate.messageSingle', {
        socialReason: row?.socialReason ?? row?.fantasyName ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: CompanyModel): void {
    this.bulk.confirmAction({
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

    this.bulk.executeAction(
      this.facade.activateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('company.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.facade.deactivateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('company.deactivate.successBulk', { count: rows.length }),
    );
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.facade.blockBulk(rows.map((row) => row.id)),
      this.i18n.tUi('company.block.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('company.activate.header'),
      message: this.i18n.tUi('company.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('company.deactivate.header'),
      message: this.i18n.tUi('company.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
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
    if (!this.secPolicy.canCreate()) return;
    this.company.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: CompanyModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.company.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.company.set(null);
  }

  onCreated() {
    this.reloadWithCurrentState();
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.COMPANY.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.COMPANY.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.COMPANY.FILTERS.V1;
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
      createdBy: this.createdBy()?.length ? this.createdBy() : null,
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

  protected override buildAdvancedFilters(): Partial<CompanyAdvancedFilters> {
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

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const fantasyName = readSingleFilterValue(filters, 'fantasyName');
    if (fantasyName) {
      items.push({ label: this.i18n.tUi('company.fields.fantasyName'), value: fantasyName });
    }

    const socialReason = readSingleFilterValue(filters, 'socialReason');
    if (socialReason) {
      items.push({ label: this.i18n.tUi('company.fields.socialReason'), value: socialReason });
    }

    const cnpj = readSingleFilterValue(filters, 'cnpj');
    if (cnpj) {
      items.push({ label: this.i18n.tUi('company.fields.cnpj'), value: cnpj });
    }

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('company.fields.statusEnum'),
        value: statuses.map((value) => statusEnumLabel(value as StatusEnum, this.i18n)).join(', '),
      });
    }

    const types = readArrayFilterValues(filters, 'typeCompanyEnum');
    if (types.length) {
      items.push({
        label: this.i18n.tUi('company.fields.typeCompanyEnum'),
        value: types
          .map((value) => typeCompanyEnumLabel(value as TypeCompanyEnum, this.i18n))
          .join(', '),
      });
    }

    const createdAt = readDateRangeFilterValue(filters, 'createdAt', this.formatDate.bind(this));
    if (createdAt) {
      items.push({ label: this.i18n.tUi('company.fields.createdAt'), value: createdAt });
    }

    const createdByValues = readArrayFilterValues(filters, 'createdBy');
    if (createdByValues.length) {
      const labels = this.usersOptions()
        .filter((option) => createdByValues.includes(option.value))
        .map((option) => option.label);

      items.push({
        label: this.i18n.tUi('company.fields.createdBy'),
        value: (labels.length ? labels : createdByValues).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<CompanyAdvancedFilters>>,
  ): void {
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }

  protected formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(date);
  }
}
