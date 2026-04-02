import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { CompanyAdvancedFilters } from '@features/filter/company.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import {
  CompanyModel,
  CompanyApiModel,
  mapCompanyApiModel,
  CompanyCreateInput,
  CompanyUpdateInput,
  mapCompanyApiModels,
  CompanyBulkStatusInput,
} from '@models/company.models';

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/company`;

  searchPaged(body: ListQueryDto<CompanyAdvancedFilters>) {
    return this.http.post<HalPagedResponse<CompanyApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: mapCompanyApiModels(res?._embedded?.content),
          }) as HalPagedResponse<CompanyModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<CompanyApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapCompanyApiModel));
  }

  create(input: CompanyCreateInput) {
    return this.http.post<CompanyApiModel>(`${this.baseUrl}`, input).pipe(map(mapCompanyApiModel));
  }

  update(id: string, input: CompanyUpdateInput) {
    return this.http
      .put<CompanyApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapCompanyApiModel));
  }

  activate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, null);
  }

  deactivate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/deactivate`, null);
  }

  block(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/block`, null);
  }

  blockBulk(input: CompanyBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/block`, input);
  }

  activateBulk(input: CompanyBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: CompanyBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }
}
