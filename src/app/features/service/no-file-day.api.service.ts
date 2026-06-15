import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { NoFileDayAdvancedFilters } from '@features/filter/no-file-day.filters';
import {
  NoFileDayModel,
  NoFileDayApiModel,
  NoFileDayCreateInput,
  NoFileDayUpdateInput,
  mapNoFileDayApiModel,
  mapNoFileDayApiModels,
  NoFileDayBulkStatusInput,
} from '@models/no-file-day.models';

@Injectable({ providedIn: 'root' })
export class NoFileDayApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/no-file-days`;

  searchPaged(body: ListQueryDto<NoFileDayAdvancedFilters>) {
    return this.http.post<HalPagedResponse<NoFileDayApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: mapNoFileDayApiModels(res?._embedded?.content),
          }) as HalPagedResponse<NoFileDayModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http
      .get<NoFileDayApiModel>(`${this.baseUrl}/${id}`)
      .pipe(map(mapNoFileDayApiModel));
  }

  create(input: NoFileDayCreateInput) {
    return this.http
      .post<NoFileDayApiModel>(`${this.baseUrl}`, input)
      .pipe(map(mapNoFileDayApiModel));
  }

  update(id: string, input: NoFileDayUpdateInput) {
    return this.http
      .put<NoFileDayApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapNoFileDayApiModel));
  }

  activate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, null);
  }

  deactivate(id: string) {
    return this.http.post<void>(`${this.baseUrl}/${id}/deactivate`, null);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  activateBulk(input: NoFileDayBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: NoFileDayBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }

  deleteBulk(input: NoFileDayBulkStatusInput) {
    return this.http.delete<void>(`${this.baseUrl}/bulk`, { body: input });
  }
}
