import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ContractAdvancedFilters } from '@features/filter/contract.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import {
  ContractModel,
  ContractApiModel,
  ContractCreateInput,
  ContractUpdateInput,
  mapContractApiModel,
  mapContractApiModels,
  ContractBulkStatusInput,
} from '@models/contract.models';

@Injectable({ providedIn: 'root' })
export class ContractApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/contracts`;

  searchPaged(body: ListQueryDto<ContractAdvancedFilters>) {
    return this.http.post<HalPagedResponse<ContractApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: mapContractApiModels(res?._embedded?.content),
          }) as HalPagedResponse<ContractModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<ContractApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapContractApiModel));
  }

  create(input: ContractCreateInput) {
    return this.http
      .post<ContractApiModel>(`${this.baseUrl}`, input)
      .pipe(map(mapContractApiModel));
  }

  update(id: string, input: ContractUpdateInput) {
    return this.http
      .put<ContractApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapContractApiModel));
  }

  validity(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/validity`, null);
  }

  expired(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/expired`, null);
  }

  closed(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/closed`, null);
  }

  closedBulk(input: ContractBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/closed`, input);
  }

  validityBulk(input: ContractBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/validity`, input);
  }

  expiredBulk(input: ContractBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/expired`, input);
  }
}
