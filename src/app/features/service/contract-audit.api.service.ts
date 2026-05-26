import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ContractAuditAdvancedFilters } from '@features/filter/contract-audit.filters';
import {
  ContractAuditApiModel,
  mapContractAuditModelApiModels,
} from '@models/contract-audit.models';

@Injectable({ providedIn: 'root' })
export class ContractAuditApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/contract-audit`;

  searchPaged(body: ListQueryDto<ContractAuditAdvancedFilters>) {
    return this.http
      .post<HalPagedResponse<ContractAuditApiModel>>(`${this.baseUrl}/divergent-fees`, body)
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              _embedded: {
                ...res?._embedded,
                content: mapContractAuditModelApiModels(res?._embedded?.content),
              },
            }) as HalPagedResponse<ContractAuditApiModel>,
        ),
      );
  }

  calculateTotals(body: ListQueryDto<ContractAuditAdvancedFilters>) {
    return this.http.post<TransactionsTotalsModel>(`${this.baseUrl}/divergent-fees-totals`, body);
  }
}
