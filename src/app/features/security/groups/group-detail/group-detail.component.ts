import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { I18nService } from '@core/i18n/i18n.service';
import { GroupsFacade } from '@features/facade/groups.facade';
import { UsersApiService } from '@features/service/users.api.service';
import { PermissionsApiService } from '@features/service/permissions.api.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { GroupModel, PermissionOptionModel, UserOptionModel } from '@models/groups.models';
import { GroupsPermissionPolicy } from '@features/security/policy/groups-permission.policy';
import { GroupsCreateDialogComponent } from '@features/security/groups/groups-create/groups-create-dialog.component';

@Component({
  standalone: true,
  selector: 'app-group-detail',
  styleUrl: './group-detail.component.scss',
  templateUrl: './group-detail.component.html',
  imports: [
    CommonModule,
    TagModule,
    CardModule,
    FormsModule,
    BadgeModule,
    ButtonModule,
    DividerModule,
    TranslateModule,
    MultiSelectModule,
    PageHeaderComponent,
    ProgressSpinnerModule,
    GroupsCreateDialogComponent,
  ],
})
export class GroupDetailComponent {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly i18n = inject(I18nService);
  readonly groups = inject(GroupsFacade);
  readonly usersApi = inject(UsersApiService);
  readonly secPolicy = inject(GroupsPermissionPolicy);
  readonly permissionsApi = inject(PermissionsApiService);

  readonly loading = signal(true);
  readonly savingUsers = signal(false);
  readonly editVisible = signal(false);
  readonly savingPermissions = signal(false);
  readonly activeTab = signal<'summary' | 'permissions' | 'users'>('summary');

  readonly selectedUserIds = signal<string[]>([]);
  readonly group = signal<GroupModel | null>(null);
  readonly userOptions = signal<UserOptionModel[]>([]);
  readonly selectedPermissionIds = signal<string[]>([]);
  readonly permissionOptions = signal<PermissionOptionModel[]>([]);

  readonly canEdit = computed(() => !!this.group() && this.secPolicy.canEdit(this.group()!));
  readonly canManageUsers = computed(
    () => !!this.group() && this.secPolicy.canManageUsers(this.group()!),
  );
  readonly canManagePermissions = computed(
    () => !!this.group() && this.secPolicy.canManagePermissions(this.group()!),
  );

  readonly initials = computed(() => this.makeInitials(this.group()?.name));
  readonly selectedUsersCount = computed(() => this.selectedUserIds().length);
  readonly selectedPermissionsCount = computed(() => this.selectedPermissionIds().length);
  readonly usersCount = computed(
    () => this.group()?.usersCount ?? this.group()?.users?.length ?? 0,
  );
  readonly isSupportGroup = computed(
    () => (this.group()?.name ?? '').trim().toUpperCase() === 'SUPPORT',
  );
  readonly descriptionText = computed(
    () => this.group()?.description || this.i18n.tUi('common.notInformed'),
  );
  readonly permissionsCount = computed(
    () => this.group()?.permissionsCount ?? this.group()?.permissions?.length ?? 0,
  );

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (!id) return;
      this.load(id);
    });
  }

  load(id: string): void {
    this.loading.set(true);

    this.groups
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (group) => {
          this.group.set(group);
          this.selectedPermissionIds.set((group.permissions ?? []).map((item) => item.id));
          this.selectedUserIds.set((group.users ?? []).map((item) => item.id));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });

    this.permissionsApi
      .getOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.permissionOptions.set(items ?? []),
        error: () => this.permissionOptions.set([]),
      });

    this.usersApi
      .getOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.userOptions.set(items ?? []),
        error: () => this.userOptions.set([]),
      });
  }

  back(): void {
    this.location.back();
  }

  openEdit(): void {
    if (!this.canEdit()) return;
    this.editVisible.set(true);
  }

  onSaved(): void {
    const id = this.group()?.id;
    if (!id) return;
    this.load(id);
  }

  setTab(tab: 'summary' | 'permissions' | 'users'): void {
    this.activeTab.set(tab);
  }

  savePermissions(): void {
    const group = this.group();
    if (!group || !this.canManagePermissions()) return;

    this.savingPermissions.set(true);
    this.groups
      .updatePermissions(group.id, { permissionIds: this.selectedPermissionIds() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.group.set(updated);
          this.selectedPermissionIds.set((updated.permissions ?? []).map((item) => item.id));
          this.savingPermissions.set(false);
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('groups.detail.permissions.saved' as never),
          });
        },
        error: () => {
          this.savingPermissions.set(false);
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('groups.detail.permissions.saveError' as never),
          });
        },
      });
  }

  saveUsers(): void {
    const group = this.group();
    if (!group || !this.canManageUsers()) return;

    this.savingUsers.set(true);
    this.groups
      .updateUsers(group.id, { userIds: this.selectedUserIds() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.group.set(updated);
          this.selectedUserIds.set((updated.users ?? []).map((item) => item.id));
          this.savingUsers.set(false);
          this.toast.add({
            severity: 'success',
            summary: this.i18n.tUi('common.success'),
            detail: this.i18n.tUi('groups.detail.users.saved' as never),
          });
        },
        error: () => {
          this.savingUsers.set(false);
          this.toast.add({
            severity: 'error',
            summary: this.i18n.tUi('common.error'),
            detail: this.i18n.tUi('groups.detail.users.saveError' as never),
          });
        },
      });
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private makeInitials(value?: string | null): string {
    const text = (value ?? '').trim();
    if (!text) return 'G';

    const parts = text
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2);

    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  }
}
