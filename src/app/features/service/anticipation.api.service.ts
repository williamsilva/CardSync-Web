import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { AnticipationAdvancedFilters } from '@features/filter/anticipation.filters';
import { AnticipationApiModel, mapAnticipationApiModels } from '@models/anticipation.model';

@Injectable({ providedIn: 'root' })
export class AnticipationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/anticipation`;

  searchPaged(body: ListQueryDto<AnticipationAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<AnticipationApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapAnticipationApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<AnticipationApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<AnticipationAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/totals`, body);
  }
}
