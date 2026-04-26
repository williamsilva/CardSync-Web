import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, computed, inject, signal } from '@angular/core';

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
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { EstablishmentFiltersState, EstablishmentModel } from '@models/establishment.models';
import { typeEstablishmentEnumSeverity } from '../../../models/enums/type-establishment.enum';
import { SelectableStatefulListPage } from '@features/list-base/selectable-stateful-list-page';
import { CsRowActionButtonComponent } from '@features/list-base/cs-row-action-button.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { EstablishmentPermissionPolicy } from '@features/security/policy/establishment-permission.policy';
import { EstablishmentCreateDialogComponent } from '../establishment-create/establishment-create-component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
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
  readPeriodFilterValue,
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
    CsRowActionButtonComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    EstablishmentCreateDialogComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class EstablishmentListComponent
  extends SelectableStatefulListPage<
    EstablishmentModel,
    StatusEnum,
    EstablishmentFiltersState,
    EstablishmentAdvancedFilters
  >
  implements AfterViewInit
{
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
  protected override readonly secPolicy = inject(EstablishmentPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly totalRecords = computed(() => this.establishmentFacade.totalRecords());

  readonly establishments = computed<EstablishmentModel[]>(
    () => this.establishmentFacade.establishment() as EstablishmentModel[],
  );

  protected override currentRows(): EstablishmentModel[] {
    return this.establishments();
  }

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
  statusEnum = signal<StatusEnum[] | null>(null);
  typeEnum = signal<TypeEstablishmentEnum[] | null>(null);

  upsertVisible = signal(false);
  establishment = signal<EstablishmentModel | null>(null);

  periodCreatedAt = signal<PeriodEnum | null>(null);
  createdAt = signal<string | string[] | null>(null);

  createdAtColumnPeriod = signal<PeriodEnum | null>(null);
  createdAtColumnDraft = signal<string | string[] | null>(null);

  pvNumberColumnDraft = signal('');
  typeColumnDraft = signal<string[] | null>(null);
  statusColumnDraft = signal<string[] | null>(null);
  companyColumnDraft = signal<string[] | null>(null);
  acquirerColumnDraft = signal<string[] | null>(null);
  createdByColumnDraft = signal<string[] | null>(null);

  readonly isCreatedAtDisabled = computed(() => !this.periodCreatedAt());
  readonly isCreatedAtColumnDisabled = computed(() => !this.createdAtColumnPeriod());

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();

    return allPeriodEnum().map((value) => ({
      label: periodEnumLabel(value, this.i18n),
      value,
    }));
  });

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

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.syncColumnDraftsFromTableState();
    });
  }

  clear() {
    this.clearSelection();
    this.resetFilters();

    this.pvNumberColumnDraft.set('');

    this.typeColumnDraft.set(null);
    this.statusColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.createdByColumnDraft.set(null);

    this.createdAtColumnDraft.set(null);
    this.createdAtColumnPeriod.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  onSaved(): void {
    this.refresh();
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

  createdAtFilterLabel(value: unknown): string {
    const filterValue = value as { period?: PeriodEnum; value?: string | string[] } | null;

    if (!filterValue?.period || !filterValue.value) {
      return '';
    }

    const periodLabel = periodEnumLabel(filterValue.period, this.i18n);
    const dateLabel = Array.isArray(filterValue.value)
      ? filterValue.value.filter(Boolean).join(' - ')
      : filterValue.value;

    return `${periodLabel}: ${dateLabel}`;
  }

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;

    if (!filters) {
      return;
    }

    this.syncTextColumnDraftFromTableState(
      filters,
      'pvNumber',
      this.pvNumberColumnDraft,
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
      'statusEnum',
      this.statusColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'typeEnum',
      this.typeColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'createdBy',
      this.createdByColumnDraft,
      readArrayFilterValues,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'createdAt',
      this.createdAtColumnPeriod,
      this.createdAtColumnDraft,
      readPeriodFilterValue,
    );
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
    const pvNumber = this.pvNumber().trim();

    const createdAt = this.createdAt();
    const periodCreatedAt = this.periodCreatedAt();

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

    if (periodCreatedAt) {
      items.push({
        label: this.i18n.tUi('establishment.fields.periodCreatedAt'),
        value: periodEnumLabel(periodCreatedAt, this.i18n),
      });
    }

    if (createdAt) {
      items.push({
        label: this.i18n.tUi('establishment.fields.createdAt'),
        value: Array.isArray(createdAt) ? createdAt.join(' - ') : createdAt,
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

    this.createdAt.set(null);
    this.periodCreatedAt.set(null);
  }

  protected override toFiltersState(): EstablishmentFiltersState {
    return {
      pvNumber: this.pvNumber(),
      typeEnum: this.typeEnum()?.length ? this.typeEnum() : null,
      company: this.companies()?.length ? this.companies() : null,
      acquirer: this.acquirers()?.length ? this.acquirers() : null,
      createdBy: this.createdBy()?.length ? this.createdBy() : null,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,

      createdAt: this.createdAt(),
      periodCreatedAt: this.periodCreatedAt(),
    };
  }

  protected override applyFiltersState(s: EstablishmentFiltersState): void {
    this.pvNumber.set(s.pvNumber ?? '');
    this.companies.set(s.company ?? null);
    this.acquirers.set(s.acquirer ?? null);
    this.createdBy.set(s.createdBy ?? null);

    this.typeEnum.set(s.typeEnum ?? null);
    this.statusEnum.set(s.statusEnum ?? null);

    this.createdAt.set(s.createdAt ?? null);
    this.periodCreatedAt.set(s.periodCreatedAt ?? null);
  }

  protected override buildAdvancedFilters(): Partial<EstablishmentAdvancedFilters> {
    return {
      company: this.companies() || null,
      acquirer: this.acquirers() || null,
      createdBy: this.createdBy() || null,
      pvNumber: this.pvNumber().trim() || undefined,

      typeEnum: this.typeEnum()?.length ? this.typeEnum() : undefined,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : undefined,

      periodCreatedAt: this.periodCreatedAt() ?? undefined,
      createdAt: this.createdAt() ?? undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const pvNumber = readSingleFilterValue(filters, 'pvNumber');
    if (pvNumber) {
      items.push({
        label: this.i18n.tUi('establishment.fields.pvNumber'),
        value: pvNumber,
      });
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

    const createdBy = readArrayFilterValues(filters, 'createdBy');
    if (createdBy.length) {
      const labels = this.usersOptions()
        .filter((option) => createdBy.includes(option.value))
        .map((option) => option.label);

      items.push({
        label: this.i18n.tUi('establishment.fields.createdBy'),
        value: (labels.length ? labels : createdBy).join(', '),
      });
    }

    const createdAt = readPeriodFilterValue(filters, 'createdAt');
    if (createdAt?.period && createdAt.value) {
      items.push({
        label: this.i18n.tUi('establishment.fields.createdAt'),
        value: this.createdAtFilterLabel(createdAt),
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
