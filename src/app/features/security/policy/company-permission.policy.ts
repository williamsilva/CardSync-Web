import { Injectable, inject } from '@angular/core';

import { CompanyModel } from '@models/company.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { normalizeStatusEnum, StatusEnum } from '@models/enums/status.enum';

@Injectable({ providedIn: 'root' })
export class CompanyPermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.has(PERMISSIONS.COMPANIES.VIEW);
  }

  canCreate(): boolean {
    return this.perms.has(PERMISSIONS.COMPANIES.CHANGE);
  }

  canEdit(_row: CompanyModel): boolean {
    return this.perms.has(PERMISSIONS.COMPANIES.CHANGE);
  }

  canActivate(row: CompanyModel): boolean {
    if (!this.perms.has(PERMISSIONS.COMPANIES.CHANGE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
  }

  canDeactivate(row: CompanyModel): boolean {
    if (!this.perms.has(PERMISSIONS.COMPANIES.CHANGE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  canBlock(row: CompanyModel): boolean {
    if (!this.perms.has(PERMISSIONS.COMPANIES.CHANGE)) {
      return false;
    }

    const status = normalizeStatusEnum(row.status);
    return status === StatusEnum.ACTIVE;
  }

  activateDisabledReason(row: CompanyModel): string | null {
    if (!this.perms.has(PERMISSIONS.COMPANIES.CHANGE)) {
      return 'company.action.activate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.INACTIVE && status !== StatusEnum.BLOCKED) {
      return 'company.action.activate.invalidStatus';
    }

    return null;
  }

  deactivateDisabledReason(row: CompanyModel): string | null {
    if (!this.perms.has(PERMISSIONS.COMPANIES.CHANGE)) {
      return 'company.action.deactivate.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'company.action.deactivate.invalidStatus';
    }

    return null;
  }

  blockDisabledReason(row: CompanyModel): string | null {
    if (!this.perms.has(PERMISSIONS.COMPANIES.CHANGE)) {
      return 'company.action.block.noPermission';
    }

    const status = normalizeStatusEnum(row.status);

    if (status !== StatusEnum.ACTIVE) {
      return 'company.action.block.invalidStatus';
    }

    return null;
  }

  selectableStatus(row: CompanyModel): StatusEnum | null {
    if (!this.perms.has(PERMISSIONS.COMPANIES.CHANGE)) {
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

  canSelectForAnyBulk(row: CompanyModel): boolean {
    return this.selectableStatus(row) !== null;
  }

  canSelectForStatus(row: CompanyModel, status: StatusEnum | null): boolean {
    if (!status) {
      return this.canSelectForAnyBulk(row);
    }

    return this.selectableStatus(row) === status;
  }

  canActivateBulk(rows: ReadonlyArray<CompanyModel> | null | undefined): boolean {
    return (
      !!rows?.length &&
      rows.every((row) => {
        const status = normalizeStatusEnum(row.status);
        return status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED;
      })
    );
  }

  canDeactivateBulk(rows: ReadonlyArray<CompanyModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }

  canBlockBulk(rows: ReadonlyArray<CompanyModel> | null | undefined): boolean {
    return (
      !!rows?.length && rows.every((row) => normalizeStatusEnum(row.status) === StatusEnum.ACTIVE)
    );
  }
}
