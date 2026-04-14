import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { FlagRelationsModel } from '@models/flag-relations.models';
import {
  FlagRelationsApiService,
  FlagAcquirerRelationCreateInput,
} from '@features/service/flag-relations.api.service';

@Injectable({ providedIn: 'root' })
export class FlagRelationsFacade {
  private readonly api = inject(FlagRelationsApiService);

  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _flag = signal<FlagRelationsModel | null>(null);

  readonly flag = this._flag.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();

  loadByFlagId(flagId: string) {
    this._loading.set(true);

    return this.api
      .findByFlagId(flagId)
      .pipe(
        finalize(() => {
          this._loading.set(false);
          this._loadedOnce.set(true);
        }),
      )
      .subscribe({
        next: (data) => this._flag.set(data),
      });
  }

  refresh(flagId: string) {
    return this.loadByFlagId(flagId);
  }

  addCompanies(flagId: string, companyIds: string[], onSuccess?: () => void) {
    return this.api.addCompanies(flagId, companyIds).subscribe({
      next: () => {
        this.refresh(flagId);
        onSuccess?.();
      },
    });
  }

  removeCompany(flagId: string, companyId: string, onSuccess?: () => void) {
    return this.api.removeCompany(flagId, companyId).subscribe({
      next: () => {
        this.refresh(flagId);
        onSuccess?.();
      },
    });
  }

  addAcquirerRelations(
    flagId: string,
    input: FlagAcquirerRelationCreateInput,
    onSuccess?: () => void,
  ) {
    return this.api.addAcquirerRelations(flagId, input).subscribe({
      next: () => {
        this.refresh(flagId);
        onSuccess?.();
      },
    });
  }

  removeAcquirer(flagId: string, acquirerId: string, onSuccess?: () => void) {
    return this.api.removeAcquirer(flagId, acquirerId).subscribe({
      next: () => {
        this.refresh(flagId);
        onSuccess?.();
      },
    });
  }

  clear() {
    this._flag.set(null);
    this._loadedOnce.set(false);
    this._loading.set(false);
  }
}
