import { Injectable, inject } from '@angular/core';

import { ContractModel } from '@models/contract.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { ContractEnum, normalizeContractEnum } from '@models/enums/contract.enum';

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

  canValidity(row: ContractModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeContractEnum(row.status);
    return status === ContractEnum.EXPIRED || status === ContractEnum.CLOSED;
  }

  canExpired(row: ContractModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeContractEnum(row.status);
    return status === ContractEnum.VALIDITY;
  }

  canClosed(row: ContractModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return false;
    }

    const status = normalizeContractEnum(row.status);
    return status === ContractEnum.VALIDITY;
  }

  validityDisabledReason(row: ContractModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return 'contract.action.validity.noPermission';
    }

    const status = normalizeContractEnum(row.status);

    if (status !== ContractEnum.EXPIRED && status !== ContractEnum.CLOSED) {
      return 'contract.action.validity.invalidStatus';
    }

    return null;
  }

  expiredDisabledReason(row: ContractModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return 'contract.action.expired.noPermission';
    }

    const status = normalizeContractEnum(row.status);

    if (status !== ContractEnum.VALIDITY) {
      return 'contract.action.expired.invalidStatus';
    }

    return null;
  }

  closedDisabledReason(row: ContractModel): string | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return 'contract.action.closed.noPermission';
    }

    const status = normalizeContractEnum(row.status);

    if (status !== ContractEnum.VALIDITY) {
      return 'contract.action.closed.invalidStatus';
    }

    return null;
  }

  selectableStatus(row: ContractModel): ContractEnum | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.CONTRACTS.ACTIVE_OR_INACTIVE)) {
      return null;
    }

    const status = normalizeContractEnum(row.status);

    if (
      status === ContractEnum.VALIDITY ||
      status === ContractEnum.EXPIRED ||
      status === ContractEnum.CLOSED
    ) {
      return status;
    }

    return null;
  }

  canSelectForAnyBulk(row: ContractModel): boolean {
    return this.selectableStatus(row) !== null;
  }

  canSelectForStatus(row: ContractModel, status: ContractEnum | null): boolean {
    if (!status) {
      return this.canSelectForAnyBulk(row);
    }

    return this.selectableStatus(row) === status;
  }

  canValidityBulk(rows: ReadonlyArray<ContractModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeContractEnum(row.status);
        return status === ContractEnum.EXPIRED || status === ContractEnum.CLOSED;
      })
    );
  }

  canExpiredBulk(rows: ReadonlyArray<ContractModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => normalizeContractEnum(row.status) === ContractEnum.VALIDITY)
    );
  }

  canClosedBulk(rows: ReadonlyArray<ContractModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => normalizeContractEnum(row.status) === ContractEnum.VALIDITY)
    );
  }
}
