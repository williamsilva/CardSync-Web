import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { BankAdvancedFilters } from '@features/filter/bank.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import {
  BankModel,
  BankApiModel,
  BankCreateInput,
  BankUpdateInput,
  BankBulkStatusInput,
  mapBankApiModel,
  mapBankApiModels,
} from '@models/bank.models';
import { BankMinimalModel, mapBankMinimalApiModels } from '@models/bank-minimal.models';

@Injectable({ providedIn: 'root' })
export class BankApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/banks`;

  getOptions() {
    return this.http
      .get<HalPagedResponse<BankMinimalModel>>(`${this.baseUrl}/options-filter`)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              content: mapBankMinimalApiModels(res?._embedded?.content),
            }) as HalPagedResponse<BankMinimalModel>,
        ),
      );
  }

  searchPaged(body: ListQueryDto<BankAdvancedFilters>) {
    return this.http.post<HalPagedResponse<BankApiModel>>(`${this.baseUrl}/search`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: mapBankApiModels(res?._embedded?.content),
          }) as HalPagedResponse<BankModel>,
      ),
    );
  }

  getById(id: string) {
    return this.http.get<BankApiModel>(`${this.baseUrl}/${id}`).pipe(map(mapBankApiModel));
  }

  create(input: BankCreateInput) {
    return this.http.post<BankApiModel>(`${this.baseUrl}`, input).pipe(map(mapBankApiModel));
  }

  update(id: string, input: BankUpdateInput) {
    return this.http
      .put<BankApiModel>(`${this.baseUrl}/${id}`, input)
      .pipe(map(mapBankApiModel));
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

  activateBulk(input: BankBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/activate`, input);
  }

  deactivateBulk(input: BankBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/deactivate`, input);
  }

  blockBulk(input: BankBulkStatusInput) {
    return this.http.post<void>(`${this.baseUrl}/block`, input);
  }
}
