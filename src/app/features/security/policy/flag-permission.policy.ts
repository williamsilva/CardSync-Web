import { Injectable, inject } from '@angular/core';

import { FlagModel } from '@models/flag.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class FlagPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.FLAGS.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.FLAGS.CREATE);
  }

  canManageRelations(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.FLAGS.MANAGE_RELATIONS);
  }

  canRemoveRelations(): boolean {
    return this.canManageRelations();
  }

  canEdit(_row: FlagModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.FLAGS.CHANGE);
  }

  canActivate(row: FlagModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.FLAGS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: FlagModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.FLAGS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  canBlock(row: FlagModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.FLAGS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  activateDisabledReason(row: FlagModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.FLAGS.ACTIVE_OR_INACTIVE)) {
      return 'flag.action.activate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.INACTIVE && status !== StatusEnum.BLOCKED) {
      return 'flag.action.activate.invalidStatus';
    }

    return null;
  }

  canSelectForAnyBulk(row: FlagModel): boolean {
    return this.selectableStatus(row) !== null;
  }

  canSelectForStatus(row: FlagModel, status: StatusEnum | null): boolean {
    if (!status) {
      return this.canSelectForAnyBulk(row);
    }

    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: ReadonlyArray<FlagModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: ReadonlyArray<FlagModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canBlockBulk(rows: ReadonlyArray<FlagModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  deactivateDisabledReason(row: FlagModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.FLAGS.ACTIVE_OR_INACTIVE)) {
      return 'flag.action.deactivate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'flag.action.deactivate.invalidStatus';
    }

    return null;
  }

  blockDisabledReason(row: FlagModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.FLAGS.ACTIVE_OR_INACTIVE)) {
      return 'flag.action.block.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'flag.action.block.invalidStatus';
    }

    return null;
  }

  selectableStatus(row: FlagModel): StatusEnum | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.FLAGS.ACTIVE_OR_INACTIVE)) {
      return null;
    }

    const status = normalizeStatusEnum(row.status);

    if (
      status === StatusEnum.ACTIVE ||
      status === StatusEnum.INACTIVE ||
      status === StatusEnum.BLOCKED
    ) {
      return status;
    }

    return null;
  }
}
