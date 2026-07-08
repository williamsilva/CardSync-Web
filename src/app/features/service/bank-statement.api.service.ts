import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { ValueTotalsModel } from '@models/value-totals-model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { BankStatementAdvancedFilters } from '@features/filter/bank-statement.filters';
import { BankStatementApiModel, mapBankStatementApiModels } from '@models/bank-statement.model';
import { ReleaseBankManualInput, ReleaseBankManualResult } from '@models/release-bank-manual.models';

@Injectable({ providedIn: 'root' })
export class BankStatementApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/releases-bank`;

  searchPaged(body: ListQueryDto<BankStatementAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<BankStatementApiModel>>(`${this.baseUrl}/search`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapBankStatementApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<BankStatementApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<BankStatementAdvancedFilters>) {
    return this.http.post<ValueTotalsModel>(`${this.baseUrl}/totals`, body);
  }

  createManual(body: ReleaseBankManualInput) {
    return this.http.post<ReleaseBankManualResult>(`${this.baseUrl}/manual`, body);
  }

  deleteManual(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/manual/${id}`);
  }
}
