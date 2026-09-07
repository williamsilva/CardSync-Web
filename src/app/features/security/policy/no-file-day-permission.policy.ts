import { Injectable, inject } from '@angular/core';

import { NoFileDayModel } from '@models/no-file-day.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class NoFileDayPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.CREATE);
  }

  // row mantido pra uniformizar a assinatura com os outros métodos da policy (o
  // chamador sempre passa a linha), mesmo sem uso aqui.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canEdit(_row: NoFileDayModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.CHANGE);
  }

  canActivate(row: NoFileDayModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.ACTIVE_OR_INACTIVE)) return false;
    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: NoFileDayModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.ACTIVE_OR_INACTIVE)) return false;
    return normalizeStatusEnum(row.status) === StatusEnum.ACTIVE;
  }

  // row mantido pra uniformizar a assinatura com os outros métodos da policy (o
  // chamador sempre passa a linha), mesmo sem uso aqui.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canDelete(_row: NoFileDayModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.DELETE);
  }

  selectableStatus(row: NoFileDayModel): StatusEnum | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.ACTIVE_OR_INACTIVE)) return null;
    const status = normalizeStatusEnum(row.status);
    if (status === StatusEnum.ACTIVE || status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED) {
      return status;
    }
    return null;
  }

  canSelectForStatus(row: NoFileDayModel, status: StatusEnum | null): boolean {
    if (!status) return this.selectableStatus(row) !== null;
    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: readonly NoFileDayModel[] | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: readonly NoFileDayModel[] | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canDeleteBulk(rows: readonly NoFileDayModel[] | null | undefined): boolean {
    return !!rows?.length && this.perms.hasSupportOr(PERMISSIONS.NO_FILE_DAY.DELETE);
  }
}
