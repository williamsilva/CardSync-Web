import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { TransactionsErpInstallmentAdvancedFilters } from '@features/filter/transaction-erp-installment.filters';
import {
  TransactionsErpInstallmentModel,
  TransactionsErpInstallmentApiModel,
  mapTransactionsErpInstallmentApiModels,
} from '@models/transactions-erp-installment.models';

@Injectable({ providedIn: 'root' })
export class TransactionsErpInstallmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/transaction/erp/installments`;

  searchPaged(body: ListQueryDto<TransactionsErpInstallmentAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<TransactionsErpInstallmentApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapTransactionsErpInstallmentApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<TransactionsErpInstallmentModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<TransactionsErpInstallmentAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/totals`, body);
  }
}
