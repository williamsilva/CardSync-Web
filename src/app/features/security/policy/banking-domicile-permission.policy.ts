import { Injectable, inject } from '@angular/core';

import { StatusEnum } from '@models/enums/status.enum';
import { BankingDomicileModel } from '@models/banking-domicile.models';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';

@Injectable({ providedIn: 'root' })
export class BankingDomicilePermissionPolicy {
  private readonly perms = inject(PermissionService);

  canView(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.BANKING_DOMICILE.VIEW);
  }

  canCreate(): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.BANKING_DOMICILE.CREATE);
  }

  canEdit(_row: BankingDomicileModel): boolean {
    return this.perms.hasSupportOr(PERMISSIONS.BANKING_DOMICILE.CHANGE);
  }

  canActivate(row: BankingDomicileModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.BANKING_DOMICILE.ACTIVE_OR_INACTIVE)) return false;
    return row.status !== StatusEnum.ACTIVE;
  }

  canDeactivate(row: BankingDomicileModel): boolean {
    if (!this.perms.hasSupportOr(PERMISSIONS.BANKING_DOMICILE.ACTIVE_OR_INACTIVE)) return false;
    return row.status === StatusEnum.ACTIVE;
  }

  selectableActive(row: BankingDomicileModel): boolean | null {
    if (!this.perms.hasSupportOr(PERMISSIONS.BANKING_DOMICILE.ACTIVE_OR_INACTIVE)) return null;
    return row.status === StatusEnum.ACTIVE;
  }

  canSelectForActive(row: BankingDomicileModel, active: boolean | null): boolean {
    if (active === null) return this.selectableActive(row) !== null;
    return this.selectableActive(row) === active;
  }

  canActivateBulk(rows: ReadonlyArray<BankingDomicileModel> | null | undefined): boolean {
    return !!rows?.length && rows.every((row) => row.status !== StatusEnum.ACTIVE);
  }

  canDeactivateBulk(rows: ReadonlyArray<BankingDomicileModel> | null | undefined): boolean {
    return !!rows?.length && rows.every((row) => row.status === StatusEnum.ACTIVE);
  }
}
