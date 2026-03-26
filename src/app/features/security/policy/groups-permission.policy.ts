import { Injectable, inject } from '@angular/core';

import { GroupModel } from '@models/groups.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';

export interface GroupPermissionTarget extends Pick<GroupModel, 'id' | 'name'> {}

@Injectable({ providedIn: 'root' })
export class GroupsPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.has(PERMISSIONS.GROUPS.VIEW);
  }

  canCreate(): boolean {
    return this.perms.has(PERMISSIONS.GROUPS.CREATE) || this.perms.has(PERMISSIONS.GROUPS.CHANGE);
  }

  canEdit(_row: GroupPermissionTarget): boolean {
    return this.perms.has(PERMISSIONS.GROUPS.UPDATE) || this.perms.has(PERMISSIONS.GROUPS.CHANGE);
  }

  canDelete(_row: GroupPermissionTarget): boolean {
    return this.perms.has(PERMISSIONS.GROUPS.DELETE) || this.perms.has(PERMISSIONS.GROUPS.CHANGE);
  }

  canManagePermissions(_row: GroupPermissionTarget): boolean {
    return this.perms.has(PERMISSIONS.GROUPS.MANAGE_PERMISSIONS) || this.perms.has(PERMISSIONS.GROUPS.CHANGE);
  }

  canManageUsers(_row: GroupPermissionTarget): boolean {
    return this.perms.has(PERMISSIONS.GROUPS.MANAGE_USERS) || this.perms.has(PERMISSIONS.GROUPS.CHANGE);
  }

  createDisabledReason(): string | null {
    if (!this.canCreate()) {
      return 'groups.action.create.noPermission';
    }

    return null;
  }

  editDisabledReason(row: GroupPermissionTarget): string | null {
    if (!this.canEdit(row)) {
      return 'groups.action.edit.noPermission';
    }

    return null;
  }

  deleteDisabledReason(row: GroupPermissionTarget): string | null {
    if (!this.canDelete(row)) {
      return 'groups.action.delete.noPermission';
    }

    return null;
  }
}
