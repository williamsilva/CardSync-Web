import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { UsersFacade } from '@features/facade/users.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { PermissionService } from '@core/auth/permission.service';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { AcquirerAdvancedFilters } from '@features/filter/acquirer.filters';
import { AcquirerModel, AcquirerFiltersState } from '@models/acquirer.models';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { CpfCnpjMaskDirective } from '@shared/directives/cpf-cnpj-mask.directive';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { AcquirerPermissionPolicy } from '@features/security/policy/acquirer-permission.policy';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import { AcquirerCompanyRelationsComponent } from '../acquirer-relations/acquirer-company-relations.component';
import { AcquirerEstablishmentRelationsComponent } from '../acquirer-relations/acquirer-establishment-relations.component';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';

import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
} from '@models/enums/status.enum';
import {
  readArrayFilterValues,
  readSingleFilterValue,
  readDateRangeFilterValue,
} from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-acquirer-list',
  templateUrl: './acquirer-list-component.html',
  imports: [
    CommonModule,
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
    AcquirerCompanyRelationsComponent,
    AcquirerEstablishmentRelationsComponent,
  ],
})
export class AcquirerListComponent extends StatefulListPage<
  AcquirerFiltersState,
  AcquirerAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  readonly facade = inject(AcquirerFacade);
  readonly userFacade = inject(UsersFacade);
  readonly perms = inject(PermissionService);
  readonly usersOptions = this.userFacade.options;

  readonly expandedAcquirerId = signal<string | null>(null);
  readonly expandedRelationType = signal<'companies' | 'establishments' | null>(null);

  protected readonly toast = inject(MessageService);
  protected override readonly i18n = inject(I18nService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(AcquirerPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: AcquirerListComponent) {
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

  upsertVisible = signal(false);
  selectedRows = signal<AcquirerModel[]>([]);
  acquirer = signal<AcquirerModel | null>(null);
  totalRecords = computed(() => this.facade.totalRecords());
  acquirers = computed<AcquirerModel[]>(() => this.facade.acquirer() as AcquirerModel[]);

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const cnpj = this.cnpj().trim();
    const createdBy = this.createdBy();
    const statusEnum = this.statusEnum();
    const fantasyName = this.fantasyName().trim();
    const socialReason = this.socialReason().trim();
    const create = this.createdAtRange();

    if (socialReason) {
      items.push({ label: this.i18n.tUi('acquirer.fields.socialReason'), value: socialReason });
    }

    if (fantasyName) {
      items.push({ label: this.i18n.tUi('acquirer.fields.fantasyName'), value: fantasyName });
    }

    if (cnpj) {
      items.push({ label: this.i18n.tUi('acquirer.fields.cnpj'), value: cnpj });
    }

    if (createdBy?.length) {
      const labels = this.usersOptions()
        .filter((opt) => createdBy.includes(opt.value))
        .map((opt) => opt.label)
        .join(', ');

      items.push({
        label: this.i18n.tUi('acquirer.fields.createdBy'),
        value: labels,
      });
    }

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('acquirer.fields.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (create?.[0] && create?.[1]) {
      items.push({
        label: this.i18n.tUi('acquirer.fields.createdAt'),
        value: `${this.formatDate(create[0])} – ${this.formatDate(create[1])}`,
      });
    }

    return items;
  });

  protected override onAfterClear(): void {
    this.clearSelection();
    this.expandedAcquirerId.set(null);
    this.expandedRelationType.set(null);
  }

  selectionStatus = computed<StatusEnum | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;
    return this.secPolicy.selectableStatus(selected[0]);
  });

  headerEligibleRows = computed(() => {
    const selectedStatus = this.selectionStatus();
    if (!selectedStatus) return [];
    return this.acquirers().filter((row) => this.secPolicy.canSelectForStatus(row, selectedStatus));
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
    return this.i18n.tUi('acquirer.selection.mode.none');
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

  isRowCheckboxDisabled(row: AcquirerModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForStatus(row, this.selectionStatus());
  }

  isRowSelected(row: AcquirerModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: AcquirerModel, checked: boolean): void {
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

  activate(row: AcquirerModel): void {
    this.bulk.executeAction(
      this.facade.activate(row.id),
      this.i18n.tUi('acquirer.activate.successSingle'),
    );
  }

  deactivate(row: AcquirerModel): void {
    this.bulk.executeAction(
      this.facade.deactivate(row.id),
      this.i18n.tUi('acquirer.deactivate.successSingle'),
    );
  }

  block(row: AcquirerModel): void {
    this.bulk.executeAction(
      this.facade.block(row.id),
      this.i18n.tUi('acquirer.block.successSingle'),
    );
  }

  confirmActivate(row: AcquirerModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('acquirer.activate.header'),
      message: this.i18n.tUi('acquirer.activate.messageSingle', {
        socialReason: row?.socialReason ?? row?.fantasyName ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: AcquirerModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('acquirer.deactivate.header'),
      message: this.i18n.tUi('acquirer.deactivate.messageSingle', {
        socialReason: row?.socialReason ?? row?.fantasyName ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: AcquirerModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('acquirer.block.header'),
      message: this.i18n.tUi('acquirer.block.messageSingle', {
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
      this.i18n.tUi('acquirer.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.facade.deactivateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('acquirer.deactivate.successBulk', { count: rows.length }),
    );
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.facade.blockBulk(rows.map((row) => row.id)),
      this.i18n.tUi('acquirer.block.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('acquirer.activate.header'),
      message: this.i18n.tUi('acquirer.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('acquirer.deactivate.header'),
      message: this.i18n.tUi('acquirer.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('acquirer.block.header'),
      message: this.i18n.tUi('acquirer.block.messageBulk', { count: rows.length }),
      icon: 'pi pi-lock',
      accept: () => this.blockSelected(),
    });
  }

  statusEnumLabel(status: StatusEnum | null) {
    return statusEnumLabel(status, this.i18n);
  }

  severityEnum(status: StatusEnum | null) {
    return statusEnumSeverity(status);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.acquirer.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: AcquirerModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.acquirer.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.acquirer.set(null);
  }

  onCreated() {
    this.reloadWithCurrentState();
  }

  toggleCompanies(row: AcquirerModel) {
    if (this.expandedAcquirerId() === row.id && this.expandedRelationType() === 'companies') {
      this.expandedAcquirerId.set(null);
      this.expandedRelationType.set(null);
      return;
    }

    this.expandedAcquirerId.set(row.id);
    this.expandedRelationType.set('companies');
  }

  toggleEstablishments(row: AcquirerModel) {
    if (this.expandedAcquirerId() === row.id && this.expandedRelationType() === 'establishments') {
      this.expandedAcquirerId.set(null);
      this.expandedRelationType.set(null);
      return;
    }

    this.expandedAcquirerId.set(row.id);
    this.expandedRelationType.set('establishments');
  }

  protected override tableStateKey(): string {
    return 'cardsync.acquirer.table.state.v1';
  }

  protected override tableRowsKey(): string {
    return 'acquirer.table.rows';
  }

  protected override filtersKey(): string {
    return 'cardsync.acquirer.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<AcquirerAdvancedFilters>(
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
  }

  protected override toFiltersState(): AcquirerFiltersState {
    const create = this.createdAtRange();

    return {
      cnpj: this.cnpj(),
      fantasyName: this.fantasyName(),
      socialReason: this.socialReason(),
      createdBy: this.createdBy()?.length ? this.createdBy() : null,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
      createdAtRange:
        create?.[0] && create?.[1] ? [create[0].toISOString(), create[1].toISOString()] : null,
    };
  }

  protected override applyFiltersState(s: AcquirerFiltersState): void {
    this.cnpj.set(s.cnpj ?? '');
    this.createdBy.set(s.createdBy ?? null);
    this.fantasyName.set(s.fantasyName ?? '');
    this.socialReason.set(s.socialReason ?? '');
    this.statusEnum.set(s.statusEnum ?? null);

    this.createdAtRange.set(
      s.createdAtRange?.[0] && s.createdAtRange?.[1]
        ? [new Date(s.createdAtRange[0]), new Date(s.createdAtRange[1])]
        : null,
    );
  }

  protected override buildAdvancedFilters(): Partial<AcquirerAdvancedFilters> {
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
      createdAtTo: createTo,
      createdAtFrom: createFrom,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const fantasyName = readSingleFilterValue(filters, 'fantasyName');
    if (fantasyName) {
      items.push({ label: this.i18n.tUi('acquirer.fields.fantasyName'), value: fantasyName });
    }

    const socialReason = readSingleFilterValue(filters, 'socialReason');
    if (socialReason) {
      items.push({ label: this.i18n.tUi('acquirer.fields.socialReason'), value: socialReason });
    }

    const cnpj = readSingleFilterValue(filters, 'cnpj');
    if (cnpj) {
      items.push({ label: this.i18n.tUi('acquirer.fields.cnpj'), value: cnpj });
    }

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('acquirer.fields.statusEnum'),
        value: statuses.map((value) => statusEnumLabel(value as StatusEnum, this.i18n)).join(', '),
      });
    }

    const createdAt = readDateRangeFilterValue(filters, 'createdAt', this.formatDate.bind(this));
    if (createdAt) {
      items.push({ label: this.i18n.tUi('acquirer.fields.createdAt'), value: createdAt });
    }

    const createdByValues = readArrayFilterValues(filters, 'createdBy');
    if (createdByValues.length) {
      const labels = this.usersOptions()
        .filter((option) => createdByValues.includes(option.value))
        .map((option) => option.label);

      items.push({
        label: this.i18n.tUi('acquirer.fields.createdBy'),
        value: (labels.length ? labels : createdByValues).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<AcquirerAdvancedFilters>>,
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
