import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { CreditOrderAdvancedFilters } from '@features/filter/credit-order.filters';
import {
  CreditOrderApiModel,
  CreditOrderImportPreviewResult,
  CreditOrderImportResult,
  CreditOrderManualInput,
  CreditOrderManualResult,
  CreditOrderPreImplantationLinkingApplyResult,
  CreditOrderPreImplantationLinkingPreviewResult,
  mapCreditOrderApiModels,
} from '@models/credit-order.model';

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

  createManual(body: CreditOrderManualInput) {
    return this.http.post<CreditOrderManualResult>(`${this.baseUrl}/manual`, body);
  }

  previewImportManual(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file, file.name));
    return this.http.post<CreditOrderImportPreviewResult>(`${this.baseUrl}/manual/import/preview`, formData);
  }

  importManual(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file, file.name));
    return this.http.post<CreditOrderImportResult>(`${this.baseUrl}/manual/import`, formData);
  }

  previewLinkPreImplantation() {
    return this.http.post<CreditOrderPreImplantationLinkingPreviewResult>(
      `${this.baseUrl}/manual/link-preimplantation/preview`,
      {},
    );
  }

  applyLinkPreImplantation(creditOrderIds?: string[]) {
    return this.http.post<CreditOrderPreImplantationLinkingApplyResult>(
      `${this.baseUrl}/manual/link-preimplantation/apply`,
      { creditOrderIds: creditOrderIds ?? null },
    );
  }
}
