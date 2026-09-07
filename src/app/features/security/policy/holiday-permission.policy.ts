import { Injectable, inject } from '@angular/core';

import { HolidayModel } from '@models/holiday.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class HolidayPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.CREATE);
  }

  // row mantido pra uniformizar a assinatura com os outros métodos da policy (o
  // chamador sempre passa a linha), mesmo sem uso aqui.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canEdit(_row: HolidayModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.CHANGE);
  }

  // row mantido pra uniformizar a assinatura com os outros métodos da policy (o
  // chamador sempre passa a linha), mesmo sem uso aqui.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canDelete(_row: HolidayModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.DELETE);
  }

  canActivate(row: HolidayModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.ACTIVE_OR_INACTIVE)) return false;
    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: HolidayModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.ACTIVE_OR_INACTIVE)) return false;
    return normalizeStatusEnum(row.status) === StatusEnum.ACTIVE;
  }

  canBlock(row: HolidayModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.ACTIVE_OR_INACTIVE)) return false;
    return normalizeStatusEnum(row.status) === StatusEnum.ACTIVE;
  }

  selectableStatus(row: HolidayModel): StatusEnum | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.HOLIDAYS.ACTIVE_OR_INACTIVE)) return null;
    const status = normalizeStatusEnum(row.status);
    if (status === StatusEnum.ACTIVE || status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED) {
      return status;
    }
    return null;
  }

  canSelectForStatus(row: HolidayModel, status: StatusEnum | null): boolean {
    if (!status) return this.selectableStatus(row) !== null;
    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: readonly HolidayModel[] | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: readonly HolidayModel[] | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canBlockBulk(rows: readonly HolidayModel[] | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }
}
