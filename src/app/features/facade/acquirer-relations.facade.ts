import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { AcquirerRelationsModel } from '@models/acquirer-relations.models';
import { AcquirerRelationsApiService } from '@features/service/acquirer-relations.api.service';

@Injectable({ providedIn: 'root' })
export class AcquirerRelationsFacade {
  private readonly api = inject(AcquirerRelationsApiService);

  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _acquirer = signal<AcquirerRelationsModel | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly acquirer = this._acquirer.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();

  loadByAcquirerId(acquirerId: string) {
    this._loading.set(true);

    return this.api
      .findByAcquirerId(acquirerId)
      .pipe(
        finalize(() => {
          this._loading.set(false);
          this._loadedOnce.set(true);
        }),
      )
      .subscribe({
        next: (data) => this._acquirer.set(data),
      });
  }

  refresh(acquirerId: string) {
    return this.loadByAcquirerId(acquirerId);
  }

  addCompanies(acquirerId: string, companyIds: string[], onSuccess?: () => void) {
    return this.api.addCompanies(acquirerId, companyIds).subscribe({
      next: () => {
        this.refresh(acquirerId);
        onSuccess?.();
      },
    });
  }

  removeCompany(acquirerId: string, companyId: string, onSuccess?: () => void) {
    return this.api.removeCompany(acquirerId, companyId).subscribe({
      next: () => {
        this.refresh(acquirerId);
        onSuccess?.();
      },
    });
  }

  addEstablishmentRelations(
    acquirerId: string,
    establishmentIds: string[],
    onSuccess?: () => void,
  ) {
    return this.api.addEstablishmentRelations(acquirerId, establishmentIds).subscribe({
      next: () => {
        this.refresh(acquirerId);
        onSuccess?.();
      },
    });
  }

  removeEstablishment(acquirerId: string, establishmentId: string, onSuccess?: () => void) {
    return this.api.removeEstablishment(acquirerId, establishmentId).subscribe({
      next: () => {
        this.refresh(acquirerId);
        onSuccess?.();
      },
    });
  }

  clear() {
    this._acquirer.set(null);
    this._loadedOnce.set(false);
    this._loading.set(false);
  }
}
