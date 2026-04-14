import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { FlagAdvancedFilters } from '@features/filter/flag.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import {
  FlagModel,
  FlagApiModel,
  FlagCreateInput,
  FlagUpdateInput,
  mapFlagApiModel,
  mapFlagApiModels,
  FlagBulkStatusInput,
} from '@models/flag.models';

@Injectable({ providedIn: 'root' })
export class FlagApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/flags`;

  searchPaged(body: ListQueryDto<FlagAdvancedFilters>) {
    return this.http.post<HalPagedResponse<FlagApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: mapFlagApiModels(res?._embedded?.content),
          }) as HalPagedResponse<FlagModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<FlagApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapFlagApiModel));
  }

  create(input: FlagCreateInput) {
    return this.http.post<FlagApiModel>(`${this.baseUrl}`, input).pipe(map(mapFlagApiModel));
  }

  update(id: string, input: FlagUpdateInput) {
    return this.http.put<FlagApiModel>(`${this.baseUrl}/${id}`, input).pipe(map(mapFlagApiModel));
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

  blockBulk(input: FlagBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/block`, input);
  }

  activateBulk(input: FlagBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: FlagBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }
}
