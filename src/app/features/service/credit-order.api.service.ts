import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { CreditOrderAdvancedFilters } from '@features/filter/credit-order.filters';
import { CreditOrderApiModel, mapCreditOrderApiModels } from '@models/credit-order.model';

@Injectable({ providedIn: 'root' })
export class CreditOrderApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/credit-order`;

  searchPaged(body: ListQueryDto<CreditOrderAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<CreditOrderApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapCreditOrderApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<CreditOrderApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<CreditOrderAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/totals`, body);
  }
}
