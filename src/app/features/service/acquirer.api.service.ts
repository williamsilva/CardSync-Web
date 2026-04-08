import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { AcquirerAdvancedFilters } from '@features/filter/acquirer.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { AcquirerMinimalModel, mapAcquirerMinimalModels } from '@models/acquirer-minimal.models';
import {
  AcquirerModel,
  AcquirerApiModel,
  mapAcquirerApiModel,
  AcquirerCreateInput,
  AcquirerUpdateInput,
  mapAcquirerApiModels,
  AcquirerBulkStatusInput,
} from '@models/acquirer.models';

@Injectable({ providedIn: 'root' })
export class AcquirerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/acquirer`;

  getOptions() {
    return this.http
      .get<HalPagedResponse<AcquirerMinimalModel>>(`${this.baseUrl}/options-filter`)
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

  searchPaged(body: ListQueryDto<AcquirerAdvancedFilters>) {
    return this.http.post<HalPagedResponse<AcquirerApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: mapAcquirerApiModels(res?._embedded?.content),
          }) as HalPagedResponse<AcquirerModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<AcquirerApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapAcquirerApiModel));
  }

  create(input: AcquirerCreateInput) {
    return this.http
      .post<AcquirerApiModel>(`${this.baseUrl}`, input)
      .pipe(map(mapAcquirerApiModel));
  }

  update(id: string, input: AcquirerUpdateInput) {
    return this.http
      .put<AcquirerApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapAcquirerApiModel));
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

  blockBulk(input: AcquirerBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/block`, input);
  }

  activateBulk(input: AcquirerBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: AcquirerBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }
}
