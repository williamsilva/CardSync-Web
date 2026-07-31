import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API } from '@core/api/api.config';
import {
  AdjustmentManualCreateInput,
  AdjustmentManualResultModel,
} from '@models/adjustment-manual.model';

@Injectable({ providedIn: 'root' })
export class AdjustmentManualApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/adjustments`;

  createManual(body: AdjustmentManualCreateInput) {
    return this.http.post<AdjustmentManualResultModel>(`${this.baseUrl}/manual`, body);
  }
}
