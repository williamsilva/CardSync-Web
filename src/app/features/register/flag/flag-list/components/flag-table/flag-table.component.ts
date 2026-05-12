import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild, computed, inject, input } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';

import { FlagModel } from '@models/flag.models';
import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { FlagPermissionPolicy } from '@features/security/policy/flag-permission.policy';
import { FlagRowActionsComponent } from '../flag-row-actions/flag-row-actions.component';
import { FlagCompanyRelationsComponent } from '@features/register/flag/flag-relations/flag-company-relations.component';
import { FlagAcquirerRelationsComponent } from '@features/register/flag/flag-relations/flag-acquirer-relations.component';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
} from '@models/enums/status.enum';

@Component({
  standalone: true,
  selector: 'app-flag-table',
  templateUrl: './flag-table.component.html',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    CheckboxModule,
    CsTagComponent,
    TranslateModule,
    MultiSelectModule,
    FlagRowActionsComponent,
    FlagCompanyRelationsComponent,
    FlagAcquirerRelationsComponent,
  ],
})
export class FlagTableComponent {
  @ViewChild('dt') private dt?: Table;

  @Output() pageChange = new EventEmitter<any>();
  @Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();

  @Output() edit = new EventEmitter<FlagModel>();
  @Output() block = new EventEmitter<FlagModel>();
  @Output() activate = new EventEmitter<FlagModel>();
  @Output() deactivate = new EventEmitter<FlagModel>();

  @Output() toggleCompanies = new EventEmitter<FlagModel>();
  @Output() toggleAcquirers = new EventEmitter<FlagModel>();

  @Output() refreshRelations = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<FlagModel[]>();

  protected readonly i18n = inject(I18nService);

  rows = input.required<number>();
  loading = input.required<boolean>();
  loadedOnce = input<boolean>(false);
  flags = input.required<FlagModel[]>();
  totalRecords = input.required<number>();
  expandedFlagId = input<string | null>(null);
  selectedRows = input.required<FlagModel[]>();
  rowsPerPageOptions = input.required<number[]>();
  secPolicy = input.required<FlagPermissionPolicy>();
  expandedRelationType = input<'companies' | 'acquirers' | null>(null);

  readonly statusEnumOptions = computed(() =>
    allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    })),
  );

  readonly selectionStatus = computed<StatusEnum | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;
    return this.secPolicy().selectableStatus(selected[0]);
  });

  readonly headerEligibleRows = computed(() => {
    const selectedStatus = this.selectionStatus();
    if (!selectedStatus) return [];
    return this.flags().filter((row) => this.secPolicy().canSelectForStatus(row, selectedStatus));
  });

  readonly headerChecked = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;
    return eligible.every((row) => this.isRowSelected(row));
  });

  readonly headerIndeterminate = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;

    const selectedCount = eligible.filter((row) => this.isRowSelected(row)).length;
    return selectedCount > 0 && selectedCount < eligible.length;
  });

  statusLabel(value: StatusEnum | null): string {
    return statusEnumLabel(value, this.i18n);
  }

  statusEnumSeverity(value: StatusEnum | null): CsTagTone {
    return statusEnumSeverity(value);
  }

  clearTableFilters(defaultRows = 10) {
    if (!this.dt) return;

    this.dt.first = 0;
    this.dt.rows = defaultRows;

    if (typeof this.dt.reset === 'function') {
      this.dt.reset();
    } else {
      this.dt.clear();
    }

    const tableAny = this.dt as any;
    if (typeof tableAny.clearState === 'function') {
      tableAny.clearState();
    }

    this.selectionChange.emit([]);
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.lazyLoad.emit(event);
  }

  onPage(event: any) {
    this.pageChange.emit(event);
  }

  isRowSelected(row: FlagModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  isRowCheckboxDisabled(row: FlagModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy().canSelectForStatus(row, this.selectionStatus());
  }

  toggleRowSelection(row: FlagModel, checked: boolean): void {
    const current = this.selectedRows();

    if (!checked) {
      this.selectionChange.emit(current.filter((item) => item.id !== row.id));
      return;
    }

    const rowStatus = this.secPolicy().selectableStatus(row);
    if (!rowStatus) return;

    if (!current.length) {
      this.selectionChange.emit([row]);
      return;
    }

    if (rowStatus !== this.selectionStatus()) return;
    if (this.isRowSelected(row)) return;

    this.selectionChange.emit([...current, row]);
  }

  toggleHeaderSelection(checked: boolean): void {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return;

    if (!checked) {
      this.selectionChange.emit([]);
      return;
    }

    this.selectionChange.emit([...eligible]);
  }
}
