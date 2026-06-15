import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { BankingDomicileAdvancedFilters } from '@features/filter/banking-domicile.filters';
import {
  BankingDomicileModel,
  BankingDomicileApiModel,
  BankingDomicileBulkInput,
  BankingDomicileCreateInput,
  BankingDomicileUpdateInput,
  mapBankingDomicileApiModel,
  mapBankingDomicileApiModels,
} from '@models/banking-domicile.models';

@Injectable({ providedIn: 'root' })
export class BankingDomicileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/banking-domiciles`;

  getOptions() {
    return this.http
      .get<HalPagedResponse<BankingDomicileApiModel>>(`${this.baseUrl}/options-filter`)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res._embedded,
                content: mapBankingDomicileApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<BankingDomicileModel>,
        ),
      );
  }

  searchPaged(body: ListQueryDto<BankingDomicileAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<BankingDomicileApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              content: mapBankingDomicileApiModels(res?._embedded?.content),
            }) as HalPagedResponse<BankingDomicileModel>,
        ),
      );
  }

  getById(id: string) {
    return this.http
      .get<BankingDomicileApiModel>(`${this.baseUrl}/${id}`)
      .pipe(map(mapBankingDomicileApiModel));
  }

  create(input: BankingDomicileCreateInput) {
    return this.http
      .post<BankingDomicileApiModel>(`${this.baseUrl}`, input)
      .pipe(map(mapBankingDomicileApiModel));
  }

  update(id: string, input: BankingDomicileUpdateInput) {
    return this.http
      .put<BankingDomicileApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapBankingDomicileApiModel));
  }

  activate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, null);
  }

  deactivate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/deactivate`, null);
  }

  activateBulk(input: BankingDomicileBulkInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: BankingDomicileBulkInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }
}
