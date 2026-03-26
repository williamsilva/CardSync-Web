import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { GroupModel } from '@models/groups.models';
import { I18nService } from '@core/i18n/i18n.service';
import { GroupsFacade } from '@features/facade/groups.facade';
import { GroupsAdvancedFilters } from '@features/filter/groups.filters';
import { BaseListPage } from '@shared/features/list-base/base-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { mapPrimeLazyToTableQuery } from '@shared/features/list-query/primeng-lazy.mapper';
import { GroupsPermissionPolicy } from '@features/security/policy/groups-permission.policy';
import { FiltersPanelComponent } from '@shared/features/filters-panel/filters-panel.component';
import { GroupsCreateDialogComponent } from '@features/security/groups/groups-create/groups-create-dialog.component';

type GroupsFiltersState = {
  name: string;
  description: string;
};

@Component({
  standalone: true,
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  imports: [
    CommonModule,
    FloatLabel,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    TranslateModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    FiltersPanelComponent,
    GroupsCreateDialogComponent,
  ],
})
export class GroupsListComponent extends BaseListPage<GroupsFiltersState> {
  @ViewChild('dt') private dt?: Table;

  readonly i18n = inject(I18nService);
  readonly facade = inject(GroupsFacade);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(GroupsPermissionPolicy);

  private searchedOnce = false;
  private skipNextLazy = false;
  private lastLazyEvent: any | null = null;

  rows = Number(localStorage.getItem('groups.table.rows')) || 10;

  name = signal('');
  description = signal('');
  upsertVisible = signal(false);
  group = signal<GroupModel | null>(null);

  readonly canCreate = computed(() => this.secPolicy.canCreate());
  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly groups = computed<GroupModel[]>(() => this.facade.groups());

  readonly activeFiltersCount = computed(() => {
    let c = 0;
    if (this.name().trim()) c++;
    if (this.description().trim()) c++;
    return c;
  });

  readonly activeFilters = computed(() => {
    const items: { label: string; value: string }[] = [];

    const name = this.name().trim();
    const description = this.description().trim();

    if (name) items.push({ label: this.i18n.tUi('groups.fields.name'), value: name });
    if (description) {
      items.push({ label: this.i18n.tUi('groups.fields.description'), value: description });
    }

    return items;
  });

  ngOnInit() {
    this.loadOnInit();

    if (this.activeFiltersCount() > 0) {
      this.searchedOnce = true;
    }

    this.skipNextLazy = true;
    this.lastLazyEvent = { first: 0, rows: this.rows, filters: undefined, globalFilter: null };
    this.reloadWithCurrentState();
  }

  goNew() {
    this.group.set(null);
    this.upsertVisible.set(true);
  }

  view(row: GroupModel) {
    this.router.navigate(['/groups', row.id]);
  }

  edit(row: GroupModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.group.set(row);
    this.upsertVisible.set(true);
  }

  confirmDelete(row: GroupModel) {
    if (!this.secPolicy.canDelete(row)) return;

    this.confirm.confirm({
      header: this.i18n.tUi('groups.delete.header' as never),
      message: this.i18n.tUi('groups.delete.message' as never, { groupName: row.name }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(row),
    });
  }

  private delete(row: GroupModel) {
    this.facade.delete(row.id).subscribe({
      next: () => {
        this.toast.add({
          severity: 'success',
          summary: this.i18n.tUi('common.success'),
          detail: this.i18n.tUi('groups.delete.success' as never),
        });
      },
    });
  }

  onSaved(): void {
    this.refresh();
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) {
      this.group.set(null);
    }
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
    localStorage.setItem('groups.table.rows', this.rows.toString());
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
    return 'cardsync.groups.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    this.name.set('');
    this.description.set('');
  }

  protected override toFiltersState(): GroupsFiltersState {
    return {
      name: this.name(),
      description: this.description(),
    };
  }

  protected override applyFiltersState(state: GroupsFiltersState): void {
    this.name.set(state.name ?? '');
    this.description.set(state.description ?? '');
  }

  private buildAdvancedFilters(): Partial<GroupsAdvancedFilters> {
    return {
      name: this.name().trim() || undefined,
      description: this.description().trim() || undefined,
    };
  }

  private reloadWithCurrentState() {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastLazyEvent ?? { first: 0, rows: this.rows },
      this.rows,
    );

    const query = buildListQuery<GroupsAdvancedFilters>(tableQuery, this.buildAdvancedFilters());

    this.rows = tableQuery.size;
    localStorage.setItem('groups.table.rows', this.rows.toString());

    this.facade.loadPage(query);
  }
}
