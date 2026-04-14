import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API } from '@core/api/api.config';
import { FlagRelationsModel } from '@models/flag-relations.models';

export interface FlagAcquirerRelationCreateItem {
  acquirerId: string;
  acquirerCode: string;
}

export interface FlagAcquirerRelationCreateInput {
  items: FlagAcquirerRelationCreateItem[];
}

@Injectable({ providedIn: 'root' })
export class FlagRelationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/flags`;

  findByFlagId(flagId: string) {
    return this.http.get<FlagRelationsModel>(`${this.baseUrl}/${flagId}/relations`);
  }

  addCompanies(flagId: string, companyIds: string[]) {
    return this.http.post<void>(`${this.baseUrl}/${flagId}/company-relations`, {
      companyIds,
    });
  }

  removeCompany(flagId: string, companyId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${flagId}/companies/${companyId}`);
  }

  addAcquirerRelations(flagId: string, input: FlagAcquirerRelationCreateInput) {
    return this.http.post<void>(`${this.baseUrl}/${flagId}/acquirer-relations`, input);
  }

  removeAcquirer(flagId: string, acquirerId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${flagId}/acquirers/${acquirerId}`);
  }
}
