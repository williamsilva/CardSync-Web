import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API } from '@core/api/api.config';
import { AcquirerRelationsModel } from '@models/acquirer-relations.models';

@Injectable({ providedIn: 'root' })
export class AcquirerRelationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/acquirer`;

  findByAcquirerId(acquirerId: string) {
    return this.http.get<AcquirerRelationsModel>(`${this.baseUrl}/${acquirerId}/relations`);
  }

  addCompanies(acquirerId: string, companyIds: string[]) {
    return this.http.post<void>(`${this.baseUrl}/${acquirerId}/company-relations`, {
      companyIds,
    });
  }

  removeCompany(acquirerId: string, companyId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${acquirerId}/companies/${companyId}`);
  }

  addEstablishmentRelations(acquirerId: string, establishmentIds: string[]) {
    return this.http.post<void>(`${this.baseUrl}/${acquirerId}/establishment-relations`, {
      establishmentIds,
    });
  }

  removeEstablishment(flagId: string, acquirerId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${flagId}/acquirers/${acquirerId}`);
  }
}
