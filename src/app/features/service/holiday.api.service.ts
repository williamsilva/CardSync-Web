import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { HolidayAdvancedFilters } from '@features/filter/holiday.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import {
  HolidayModel,
  HolidayApiModel,
  HolidayCreateInput,
  HolidayUpdateInput,
  HolidayBulkStatusInput,
  mapHolidayApiModel,
  mapHolidayApiModels,
} from '@models/holiday.models';

@Injectable({ providedIn: 'root' })
export class HolidayApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/holidays`;

  searchPaged(body: ListQueryDto<HolidayAdvancedFilters>) {
    return this.http.post<HalPagedResponse<HolidayApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: mapHolidayApiModels(res?._embedded?.content),
          }) as HalPagedResponse<HolidayModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<HolidayApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapHolidayApiModel));
  }

  create(input: HolidayCreateInput) {
    return this.http.post<HolidayApiModel>(`${this.baseUrl}`, input).pipe(map(mapHolidayApiModel));
  }

  update(id: string, input: HolidayUpdateInput) {
    return this.http
      .put<HolidayApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapHolidayApiModel));
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

  activateBulk(input: HolidayBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: HolidayBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }

  blockBulk(input: HolidayBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/block`, input);
  }
}
