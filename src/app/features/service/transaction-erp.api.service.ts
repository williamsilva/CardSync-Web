import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { TransactionsErpAdvancedFilters } from '@features/filter/transaction-erp.filters';
import {
  TransactionsErpModel,
  TransactionsErpApiModel,
  TransactionsErpTotalsModel,
  mapTransactionsErpApiModels,
} from '@models/transactions-erp.models';

@Injectable({ providedIn: 'root' })
export class TransactionsErpApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/transaction/erp/sales`;

  searchPaged(body: ListQueryDto<TransactionsErpAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<TransactionsErpApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapTransactionsErpApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<TransactionsErpModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<TransactionsErpAdvancedFilters>) {
    return this.http.post<TransactionsErpTotalsModel>(`${this.baseUrl}/totals`, body);
  }
}
