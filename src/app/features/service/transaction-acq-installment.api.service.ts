import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { TransactionsAcqInstallmentAdvancedFilters } from '@features/filter/transaction-acq-installment.filters';
import {
  TransactionsAcqInstallmentModel,
  TransactionsAcqInstallmentApiModel,
  mapTransactionsAcqInstallmentApiModels,
} from '@models/transactions-acq-installment.models';

@Injectable({ providedIn: 'root' })
export class TransactionsAcqInstallmentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/transaction/acq/installments`;

  searchPaged(body: ListQueryDto<TransactionsAcqInstallmentAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<TransactionsAcqInstallmentApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapTransactionsAcqInstallmentApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<TransactionsAcqInstallmentModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<TransactionsAcqInstallmentAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/totals`, body);
  }
}
