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
import { UsersFacade } from '@features/facade/users.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { EstablishmentAdvancedFilters } from '@features/filter/establishment.filters';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { EstablishmentFiltersState, EstablishmentModel } from '@models/establishment.models';
import { typeEstablishmentEnumSeverity } from '../../../models/enums/type-establishment.enum';
import { EstablishmentPermissionPolicy } from '@features/security/policy/establishment-permission.policy';
import { EstablishmentCreateDialogComponent } from '../establishment-create/establishment-create-component';
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
import {
  TypeEstablishmentEnum,
  allTypeEstablishmentEnum,
  typeEstablishmentEnumLabel,
} from '@models/enums/type-establishment.enum';

@Component({
  standalone: true,
  selector: 'app-establishment-list',
  templateUrl: './establishment-list-component.html',
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
    FiltersPanelComponent,
    EstablishmentCreateDialogComponent,
  ],
})
export class EstablishmentListComponent extends StatefulListPage<
  EstablishmentFiltersState,
  EstablishmentAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  readonly userFacade = inject(UsersFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  readonly usersOptions = this.userFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;

  protected readonly toast = inject(MessageService);
  protected override readonly i18n = inject(I18nService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(EstablishmentPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly totalRecords = computed(() => this.establishmentFacade.totalRecords());

  readonly establishments = computed<EstablishmentModel[]>(
    () => this.establishmentFacade.establishment() as EstablishmentModel[],
  );

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: EstablishmentListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  skeletonRows = Array.from({ length: 8 });

  pvNumber = signal('');
  createdBy = signal<string[] | null>(null);
  companies = signal<string[] | null>(null);
  acquirers = signal<string[] | null>(null);
  createdAtRange = signal<Date[] | null>(null);
  statusEnum = signal<StatusEnum[] | null>(null);
  typeEnum = signal<TypeEstablishmentEnum[] | null>(null);

  upsertVisible = signal(false);
  selectedRows = signal<EstablishmentModel[]>([]);
  establishment = signal<EstablishmentModel | null>(null);

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly typeEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allTypeEstablishmentEnum().map((value) => ({
      label: typeEstablishmentEnumLabel(value, this.i18n),
      value,
    }));
  });

  selectionStatus = computed<StatusEnum | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;
    return this.secPolicy.selectableStatus(selected[0]);
  });

  headerEligibleRows = computed(() => {
    const selectedStatus = this.selectionStatus();
    if (!selectedStatus) return [];
    return this.establishments().filter((row) =>
      this.secPolicy.canSelectForStatus(row, selectedStatus),
    );
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
    return this.i18n.tUi('establishment.selection.mode.none');
  });

  ngOnInit() {
    this.userFacade.loadUsersOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.initStatefulList();
  }

  clear() {
    this.clearSelection();
    this.clearTableAndReload(this.dt);
  }

  onSaved(): void {
    this.refresh();
  }

  isRowCheckboxDisabled(row: EstablishmentModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForStatus(row, this.selectionStatus());
  }

  isRowSelected(row: EstablishmentModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: EstablishmentModel, checked: boolean): void {
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

  activate(row: EstablishmentModel): void {
    this.bulk.executeAction(
      this.establishmentFacade.activate(row.id),
      this.i18n.tUi('establishment.activate.successSingle'),
    );
  }

  deactivate(row: EstablishmentModel): void {
    this.bulk.executeAction(
      this.establishmentFacade.deactivate(row.id),
      this.i18n.tUi('establishment.deactivate.successSingle'),
    );
  }

  block(row: EstablishmentModel): void {
    this.bulk.executeAction(
      this.establishmentFacade.block(row.id),
      this.i18n.tUi('establishment.block.successSingle'),
    );
  }

  delete(row: EstablishmentModel): void {
    this.bulk.executeAction(
      this.establishmentFacade.delete(row.id),
      this.i18n.tUi('establishment.delete.successSingle'),
    );
  }

  confirmActivate(row: EstablishmentModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('establishment.activate.header'),
      message: this.i18n.tUi('establishment.activate.messageSingle', {
        pvNumber: row?.pvNumber ?? row?.pvNumber ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: EstablishmentModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('establishment.deactivate.header'),
      message: this.i18n.tUi('establishment.deactivate.messageSingle', {
        pvNumber: row?.pvNumber ?? row?.pvNumber ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: EstablishmentModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('establishment.block.header'),
      message: this.i18n.tUi('establishment.block.messageSingle', {
        pvNumber: row?.pvNumber ?? row?.pvNumber ?? row?.id ?? '',
      }),
      icon: 'pi pi-lock',
      accept: () => this.block(row),
    });
  }

  confirmDelete(row: EstablishmentModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('establishment.delete.header'),
      message: this.i18n.tUi('establishment.delete.messageSingle', {
        pvNumber: row?.pvNumber ?? row?.pvNumber ?? row?.id ?? '',
      }),
      icon: 'pi pi-lock',
      accept: () => this.delete(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.establishmentFacade.activateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('establishment.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.establishmentFacade.deactivateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('establishment.deactivate.successBulk', { count: rows.length }),
    );
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.establishmentFacade.blockBulk(rows.map((row) => row.id)),
      this.i18n.tUi('establishment.block.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('establishment.activate.header'),
      message: this.i18n.tUi('establishment.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('establishment.deactivate.header'),
      message: this.i18n.tUi('establishment.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('establishment.block.header'),
      message: this.i18n.tUi('establishment.block.messageBulk', { count: rows.length }),
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

  typeEstablishmentEnumLabel(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumLabel(status, this.i18n);
  }

  severityTypeEstablishmentEnum(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumSeverity(status);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.establishment.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: EstablishmentModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.establishment.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.establishment.set(null);
  }

  onCreated() {
    this.reloadWithCurrentState();
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }

  protected formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(date);
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const typeEnum = this.typeEnum();
    const createdBy = this.createdBy();
    const acquirers = this.acquirers();
    const companies = this.companies();
    const statusEnum = this.statusEnum();
    const create = this.createdAtRange();
    const pvNumber = this.pvNumber().trim();

    if (pvNumber) {
      items.push({ label: this.i18n.tUi('establishment.fields.pvNumber'), value: pvNumber });
    }

    if (createdBy?.length) {
      const labels = this.usersOptions()
        .filter((opt) => createdBy.includes(opt.value))
        .map((opt) => opt.label)
        .join(', ');

      items.push({
        label: this.i18n.tUi('establishment.fields.createdBy'),
        value: labels,
      });
    }

    if (acquirers?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirers.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('establishment.fields.acquirer'),
        value: labels,
      });
    }

    if (companies?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => companies.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('establishment.fields.company'),
        value: labels,
      });
    }

    if (typeEnum?.length) {
      items.push({
        label: this.i18n.tUi('establishment.fields.typeEnum'),
        value: typeEnum.map((v) => typeEstablishmentEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('establishment.fields.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (create?.[0] && create?.[1]) {
      items.push({
        label: this.i18n.tUi('establishment.fields.createdAt'),
        value: `${this.formatDate(create[0])} – ${this.formatDate(create[1])}`,
      });
    }

    return items;
  });

  protected override loadFirstPage() {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<EstablishmentAdvancedFilters>(
      tableQuery as any,
      this.buildAdvancedFilters(),
    );

    this.clearSelection();
    this.establishmentFacade.loadPage(query);
  }

  protected override tableStateKey(): string {
    return 'cardsync.establishment.table.state.v1';
  }

  protected override tableRowsKey(): string {
    return 'establishment.table.rows';
  }

  protected override filtersKey(): string {
    return 'cardsync.establishment.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    this.pvNumber.set('');

    this.typeEnum.set(null);
    this.createdBy.set(null);
    this.acquirers.set(null);
    this.companies.set(null);
    this.statusEnum.set(null);
    this.createdAtRange.set(null);
  }

  protected override toFiltersState(): EstablishmentFiltersState {
    const create = this.createdAtRange();

    return {
      pvNumber: this.pvNumber(),
      typeEnum: this.typeEnum()?.length ? this.typeEnum() : null,
      company: this.companies()?.length ? this.companies() : null,
      acquirer: this.acquirers()?.length ? this.acquirers() : null,
      createdBy: this.createdBy()?.length ? this.createdBy() : null,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
      createdAtRange:
        create?.[0] && create?.[1] ? [create[0].toISOString(), create[1].toISOString()] : null,
    };
  }

  protected override applyFiltersState(s: EstablishmentFiltersState): void {
    this.pvNumber.set(s.pvNumber ?? '');
    this.companies.set(s.company ?? null);
    this.acquirers.set(s.acquirer ?? null);
    this.createdBy.set(s.createdBy ?? null);

    this.typeEnum.set(s.typeEnum ?? null);
    this.statusEnum.set(s.statusEnum ?? null);

    this.createdAtRange.set(
      s.createdAtRange?.[0] && s.createdAtRange?.[1]
        ? [new Date(s.createdAtRange[0]), new Date(s.createdAtRange[1])]
        : null,
    );
  }

  protected override buildAdvancedFilters(): Partial<EstablishmentAdvancedFilters> {
    const create = this.createdAtRange();

    const [createFrom, createTo] =
      create?.[0] && create?.[1]
        ? [create[0].toISOString(), create[1].toISOString()]
        : [undefined, undefined];

    return {
      company: this.companies() || null,
      acquirer: this.acquirers() || null,
      createdBy: this.createdBy() || null,
      pvNumber: this.pvNumber().trim() || undefined,

      typeEnum: this.typeEnum()?.length ? this.typeEnum() : undefined,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : undefined,
      createdAtTo: createTo,
      createdAtFrom: createFrom,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const pvNumber = readSingleFilterValue(filters, 'pvNumber');
    if (pvNumber) {
      items.push({ label: this.i18n.tUi('establishment.fields.pvNumber'), value: pvNumber });
    }

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('establishment.fields.statusEnum'),
        value: statuses.map((value) => statusEnumLabel(value as StatusEnum, this.i18n)).join(', '),
      });
    }

    const typeEnum = readArrayFilterValues(filters, 'typeEnum');
    if (typeEnum.length) {
      items.push({
        label: this.i18n.tUi('establishment.fields.typeEnum'),
        value: typeEnum
          .map((value) => typeEstablishmentEnumLabel(value as TypeEstablishmentEnum, this.i18n))
          .join(', '),
      });
    }

    const createdAt = readDateRangeFilterValue(filters, 'createdAt', this.formatDate.bind(this));
    if (createdAt) {
      items.push({ label: this.i18n.tUi('establishment.fields.createdAt'), value: createdAt });
    }

    const companiesValues = readArrayFilterValues(filters, 'company');
    if (companiesValues.length) {
      const labels = this.companiesOptions()
        .filter((option) => companiesValues.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('establishment.fields.company'),
        value: (labels.length ? labels : companiesValues).join(', '),
      });
    }

    const acquirersValues = readArrayFilterValues(filters, 'acquirer');
    if (acquirersValues.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirersValues.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('establishment.fields.acquirer'),
        value: (labels.length ? labels : acquirersValues).join(', '),
      });
    }
    const createdByValues = readArrayFilterValues(filters, 'createdBy');
    if (createdByValues.length) {
      const labels = this.usersOptions()
        .filter((option) => createdByValues.includes(option.value))
        .map((option) => option.label);

      items.push({
        label: this.i18n.tUi('establishment.fields.createdBy'),
        value: (labels.length ? labels : createdByValues).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<EstablishmentAdvancedFilters>>,
  ): void {
    this.clearSelection();
    this.establishmentFacade.loadPage(query);
  }
}
