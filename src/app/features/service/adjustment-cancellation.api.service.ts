import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ValueTotalsModel } from '@models/value-totals-model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { CancellationAdvancedFilters } from '@features/filter/adjustment-cancellation.filters';
import {
  AdjustmentCancellationApiModel,
  mapAdjustmentCancellationApiModels,
} from '@models/adjustment-cancellation.model';

@Injectable({ providedIn: 'root' })
export class AdjustmentCancellationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/adjustments`;

  searchPaged(body: ListQueryDto<CancellationAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<AdjustmentCancellationApiModel>>(`${this.baseUrl}/cancellation`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapAdjustmentCancellationApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<AdjustmentCancellationApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<CancellationAdvancedFilters>) {
    return this.http.post<ValueTotalsModel>(`${this.baseUrl}/cancellation-totals`, body);
  }
}
