import { Injectable, inject, signal } from '@angular/core';

import { catchError, finalize, map, of, tap } from 'rxjs';

import { FlagMinimalModel } from '@models/flag-minimal.models';
import { AcquirerMinimalModel } from '@models/acquirer-minimal.models';
import { EstablishmentMinimalModel } from '@models/establishment-minimal.models';
import { ContractLookupApiService } from '@features/service/contract-lookup.api.service';

@Injectable({ providedIn: 'root' })
export class ContractLookupFacade {
  private readonly api = inject(ContractLookupApiService);

  private readonly _acquirerOptions = signal<AcquirerMinimalModel[]>([]);
  private readonly _establishmentOptions = signal<EstablishmentMinimalModel[]>([]);
  private readonly _flagOptions = signal<FlagMinimalModel[]>([]);

  private readonly _loadingAcquirers = signal(false);
  private readonly _loadingEstablishments = signal(false);
  private readonly _loadingFlags = signal(false);

  readonly acquirerOptions = this._acquirerOptions.asReadonly();
  readonly establishmentOptions = this._establishmentOptions.asReadonly();
  readonly flagOptions = this._flagOptions.asReadonly();

  readonly loadingAcquirers = this._loadingAcquirers.asReadonly();
  readonly loadingEstablishments = this._loadingEstablishments.asReadonly();
  readonly loadingFlags = this._loadingFlags.asReadonly();

  clearAcquirers(): void {
    this._acquirerOptions.set([]);
  }

  clearEstablishments(): void {
    this._establishmentOptions.set([]);
  }

  clearFlags(): void {
    this._flagOptions.set([]);
  }

  clearAll(): void {
    this.clearAcquirers();
    this.clearEstablishments();
    this.clearFlags();
  }

  loadAcquirersByCompany(companyId: string) {
    this._loadingAcquirers.set(true);

    return this.api.getAcquirersByCompany(companyId).pipe(
      map((res) => res?._embedded?.content ?? []),
      tap((items) => this._acquirerOptions.set(items)),
      catchError(() => {
        this._acquirerOptions.set([]);
        return of([] as AcquirerMinimalModel[]);
      }),
      finalize(() => this._loadingAcquirers.set(false)),
    );
  }

  loadEstablishments(companyId: string, acquirerId: string) {
    this._loadingEstablishments.set(true);

    return this.api.getEstablishments(companyId, acquirerId).pipe(
      map((res) => res?._embedded?.content ?? []),
      tap((items) => this._establishmentOptions.set(items)),
      catchError(() => {
        this._establishmentOptions.set([]);
        return of([] as EstablishmentMinimalModel[]);
      }),
      finalize(() => this._loadingEstablishments.set(false)),
    );
  }

  loadFlags(companyId: string, acquirerId: string) {
    this._loadingFlags.set(true);

    return this.api.getFlags(companyId, acquirerId).pipe(
      map((res) => res?._embedded?.content ?? []),
      tap((items) => this._flagOptions.set(items)),
      catchError(() => {
        this._flagOptions.set([]);
        return of([] as FlagMinimalModel[]);
      }),
      finalize(() => this._loadingFlags.set(false)),
    );
  }
}
