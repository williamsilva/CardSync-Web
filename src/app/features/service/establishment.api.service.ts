import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { EstablishmentAdvancedFilters } from '@features/filter/establishment.filters';
import {
  EstablishmentModel,
  EstablishmentApiModel,
  EstablishmentCreateInput,
  EstablishmentUpdateInput,
  mapEstablishmentApiModel,
  mapEstablishmentApiModels,
  EstablishmentBulkStatusInput,
} from '@models/establishment.models';

@Injectable({ providedIn: 'root' })
export class EstablishmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/establishments`;

  searchPaged(body: ListQueryDto<EstablishmentAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<EstablishmentApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              content: mapEstablishmentApiModels(res?._embedded?.content),
            }) as HalPagedResponse<EstablishmentModel>,
        ),
      );
  }

  getById(id: string) {
    return this.http
      .get<EstablishmentApiModel>(`${this.baseUrl}/${id}`)
      .pipe(map(mapEstablishmentApiModel));
  }

  create(input: EstablishmentCreateInput) {
    return this.http
      .post<EstablishmentApiModel>(`${this.baseUrl}`, input)
      .pipe(map(mapEstablishmentApiModel));
  }

  update(id: string, input: EstablishmentUpdateInput) {
    return this.http
      .put<EstablishmentApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapEstablishmentApiModel));
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

  blockBulk(input: EstablishmentBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/block`, input);
  }

  activateBulk(input: EstablishmentBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: EstablishmentBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }
}
