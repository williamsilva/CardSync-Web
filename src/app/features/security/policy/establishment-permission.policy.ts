import { Injectable, inject } from '@angular/core';

import { EstablishmentModel } from '@models/establishment.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class EstablishmentPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.CREATE);
  }

  canEdit(_row: EstablishmentModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.CHANGE);
  }

  canActivate(row: EstablishmentModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: EstablishmentModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  canBlock(row: EstablishmentModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  canDelete(row: EstablishmentModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.DELETE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  activateDisabledReason(row: EstablishmentModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.ACTIVE_OR_INACTIVE)) {
      return 'establishment.action.activate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.INACTIVE && status !== StatusEnum.BLOCKED) {
      return 'establishment.action.activate.invalidStatus';
    }

    return null;
  }

  deactivateDisabledReason(row: EstablishmentModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.ACTIVE_OR_INACTIVE)) {
      return 'establishment.action.deactivate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'establishment.action.deactivate.invalidStatus';
    }

    return null;
  }

  blockDisabledReason(row: EstablishmentModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.ACTIVE_OR_INACTIVE)) {
      return 'establishment.action.block.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'establishment.action.block.invalidStatus';
    }

    return null;
  }

  deleteDisabledReason(row: EstablishmentModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.DELETE)) {
      return 'establishment.action.delete.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'establishment.action.delete.invalidStatus';
    }

    return null;
  }

  selectableStatus(row: EstablishmentModel): StatusEnum | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.ESTABLISHMENT.ACTIVE_OR_INACTIVE)) {
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

  canSelectForAnyBulk(row: EstablishmentModel): boolean {
    return this.selectableStatus(row) !== null;
  }

  canSelectForStatus(row: EstablishmentModel, status: StatusEnum | null): boolean {
    if (!status) {
      return this.canSelectForAnyBulk(row);
    }

    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: ReadonlyArray<EstablishmentModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: ReadonlyArray<EstablishmentModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canBlockBulk(rows: ReadonlyArray<EstablishmentModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }
}
