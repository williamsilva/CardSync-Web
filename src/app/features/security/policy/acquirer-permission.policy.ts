import { Injectable, inject } from '@angular/core';

import { AcquirerModel } from '@models/acquirer.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class AcquirerPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.has(PERMISSIONS.ACQUIRER.VIEW);
  }

  canCreate(): boolean {
    return this.perms.has(PERMISSIONS.ACQUIRER.CHANGE);
  }

  canEdit(_row: AcquirerModel): boolean {
    return this.perms.has(PERMISSIONS.ACQUIRER.CHANGE);
  }

  canActivate(row: AcquirerModel): boolean {
    if (!this.perms.has(PERMISSIONS.ACQUIRER.CHANGE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: AcquirerModel): boolean {
    if (!this.perms.has(PERMISSIONS.ACQUIRER.CHANGE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  canBlock(row: AcquirerModel): boolean {
    if (!this.perms.has(PERMISSIONS.ACQUIRER.CHANGE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  activateDisabledReason(row: AcquirerModel): string | null {
    if (!this.perms.has(PERMISSIONS.ACQUIRER.CHANGE)) {
      return 'acquirer.action.activate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.INACTIVE && status !== StatusEnum.BLOCKED) {
      return 'acquirer.action.activate.invalidStatus';
    }

    return null;
  }

  deactivateDisabledReason(row: AcquirerModel): string | null {
    if (!this.perms.has(PERMISSIONS.ACQUIRER.CHANGE)) {
      return 'acquirer.action.deactivate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'acquirer.action.deactivate.invalidStatus';
    }

    return null;
  }

  blockDisabledReason(row: AcquirerModel): string | null {
    if (!this.perms.has(PERMISSIONS.ACQUIRER.CHANGE)) {
      return 'acquirer.action.block.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'acquirer.action.block.invalidStatus';
    }

    return null;
  }

  selectableStatus(row: AcquirerModel): StatusEnum | null {
    if (!this.perms.has(PERMISSIONS.ACQUIRER.CHANGE)) {
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

  canSelectForAnyBulk(row: AcquirerModel): boolean {
    return this.selectableStatus(row) !== null;
  }

  canSelectForStatus(row: AcquirerModel, status: StatusEnum | null): boolean {
    if (!status) {
      return this.canSelectForAnyBulk(row);
    }

    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: ReadonlyArray<AcquirerModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: ReadonlyArray<AcquirerModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canBlockBulk(rows: ReadonlyArray<AcquirerModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }
}
