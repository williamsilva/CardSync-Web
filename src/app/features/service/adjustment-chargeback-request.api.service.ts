import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ChargebackRequestAdvancedFilters } from '@features/filter/chargeback-request.filters';
import {
  ChargebackRequestApiModel,
  ChargebackRequestTotalsModel,
  mapChargebackRequestApiModels,
} from '@models/chargeback-request.model';

@Injectable({ providedIn: 'root' })
export class ChargebackRequestApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/adjustments`;

  searchPaged(body: ListQueryDto<ChargebackRequestAdvancedFilters>) {
    return this.http
      .post<
        HalPagedResponse<ChargebackRequestApiModel>
      >(`${this.baseUrl}/chargeback-requests`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapChargebackRequestApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<ChargebackRequestApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<ChargebackRequestAdvancedFilters>) {
    return this.http.post<ChargebackRequestTotalsModel>(
      `${this.baseUrl}/chargeback-requests-totals`,
      body,
    );
  }
}
