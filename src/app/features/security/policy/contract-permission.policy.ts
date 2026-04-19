import { Injectable, inject } from '@angular/core';

import { ContractModel } from '@models/contract.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class ContractPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.CREATE);
  }

  canEdit(_row: ContractModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.CHANGE);
  }

  canActivate(row: ContractModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: ContractModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  canBlock(row: ContractModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  activateDisabledReason(row: ContractModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return 'contract.action.activate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.INACTIVE && status !== StatusEnum.BLOCKED) {
      return 'contract.action.activate.invalidStatus';
    }

    return null;
  }

  deactivateDisabledReason(row: ContractModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return 'contract.action.deactivate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'contract.action.deactivate.invalidStatus';
    }

    return null;
  }

  blockDisabledReason(row: ContractModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return 'contract.action.block.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'contract.action.block.invalidStatus';
    }

    return null;
  }

  selectableStatus(row: ContractModel): StatusEnum | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
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

  canSelectForAnyBulk(row: ContractModel): boolean {
    return this.selectableStatus(row) !== null;
  }

  canSelectForStatus(row: ContractModel, status: StatusEnum | null): boolean {
    if (!status) {
      return this.canSelectForAnyBulk(row);
    }

    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: ReadonlyArray<ContractModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: ReadonlyArray<ContractModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canBlockBulk(rows: ReadonlyArray<ContractModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }
}
