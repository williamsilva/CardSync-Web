import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import {
  FlagMinimalModel,
  mapFlagMinimalModels,
} from '@models/flag-minimal.models';
import {
  AcquirerMinimalModel,
  mapAcquirerMinimalModels,
} from '@models/acquirer-minimal.models';
import {
  EstablishmentMinimalModel,
  mapEstablishmentMinimalModels,
} from '@models/establishment-minimal.models';

@Injectable({ providedIn: 'root' })
export class ContractLookupApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/contracts/lookups`;

  getAcquirersByCompany(companyId: string) {
    return this.http
      .get<HalPagedResponse<AcquirerMinimalModel>>(`${this.baseUrl}/acquirers`, {
        params: { companyId },
      })
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              content: mapAcquirerMinimalModels(res?._embedded?.content),
            }) as HalPagedResponse<AcquirerMinimalModel>,
        ),
      );
  }

  getEstablishments(companyId: string, acquirerId: string) {
    return this.http
      .get<HalPagedResponse<EstablishmentMinimalModel>>(`${this.baseUrl}/establishments`, {
        params: { companyId, acquirerId },
      })
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              content: mapEstablishmentMinimalModels(res?._embedded?.content),
            }) as HalPagedResponse<EstablishmentMinimalModel>,
        ),
      );
  }

  getFlags(companyId: string, acquirerId: string) {
    return this.http
      .get<HalPagedResponse<FlagMinimalModel>>(`${this.baseUrl}/flags`, {
        params: { companyId, acquirerId },
      })
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              content: mapFlagMinimalModels(res?._embedded?.content),
            }) as HalPagedResponse<FlagMinimalModel>,
        ),
      );
  }
}
