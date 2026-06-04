import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { SaleSummaryAdvancedFilters } from '@features/filter/sale-summary.filters';
import { mapSaleSummaryApiModels, SaleSummaryApiModel } from '@models/sales-summary.model';

@Injectable({ providedIn: 'root' })
export class SaleSummaryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/sales-summary`;

  searchPaged(body: ListQueryDto<SaleSummaryAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<SaleSummaryApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapSaleSummaryApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<SaleSummaryApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<SaleSummaryAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/totals`, body);
  }
}
