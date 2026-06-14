import { Injectable, inject } from '@angular/core';

import { BankModel } from '@models/bank.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class BankPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.BANKS.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.BANKS.CREATE);
  }

  canEdit(_row: BankModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.BANKS.CHANGE);
  }

  canActivate(row: BankModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.BANKS.ACTIVE_OR_INACTIVE)) return false;
    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: BankModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.BANKS.ACTIVE_OR_INACTIVE)) return false;
    return normalizeStatusEnum(row.status) === StatusEnum.ACTIVE;
  }

  canBlock(row: BankModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.BANKS.ACTIVE_OR_INACTIVE)) return false;
    return normalizeStatusEnum(row.status) === StatusEnum.ACTIVE;
  }

  selectableStatus(row: BankModel): StatusEnum | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.BANKS.ACTIVE_OR_INACTIVE)) return null;
    const status = normalizeStatusEnum(row.status);
    if (status === StatusEnum.ACTIVE || status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED) {
      return status;
    }
    return null;
  }

  canSelectForStatus(row: BankModel, status: StatusEnum | null): boolean {
    if (!status) return this.selectableStatus(row) !== null;
    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: ReadonlyArray<BankModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: ReadonlyArray<BankModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canBlockBulk(rows: ReadonlyArray<BankModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }
}
