import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { TransactionsAcqAdvancedFilters } from '@features/filter/transaction-acq.filters';
import {
  TransactionsAcqModel,
  TransactionsAcqApiModel,
  mapTransactionsAcqApiModels,
} from '@models/transactions-acq.models';

@Injectable({ providedIn: 'root' })
export class TransactionsAcqApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/transaction/acq/sales`;

  searchPaged(body: ListQueryDto<TransactionsAcqAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<TransactionsAcqApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapTransactionsAcqApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<TransactionsAcqModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<TransactionsAcqAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/totals`, body);
  }
}
