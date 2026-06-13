import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { AdjustmentTotalsModel } from '@models/adjustmentTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { AdjustmentAdvancedFilters } from '@features/filter/adjustment-tariffs.filters';
import {
  AdjustmentTariffsApiModel,
  mapAdjustmentTariffsApiModels,
} from '@models/adjustment-tariffs.model';

@Injectable({ providedIn: 'root' })
export class AdjustmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/adjustments`;

  searchPaged(body: ListQueryDto<AdjustmentAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<AdjustmentTariffsApiModel>>(`${this.baseUrl}/tariffs`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapAdjustmentTariffsApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<AdjustmentTariffsApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<AdjustmentAdvancedFilters>) {
    return this.http.post<AdjustmentTotalsModel>(`${this.baseUrl}/tariffs-totals`, body);
  }
}
