import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import {
  AdjustmentManualCreateInput,
  AdjustmentManualResultModel,
} from '@models/adjustment-manual.model';
import { AdjustmentManualApiService } from '@features/service/adjustment-manual.api.service';

@Injectable({ providedIn: 'root' })
export class AdjustmentManualFacade {
  private readonly api = inject(AdjustmentManualApiService);

  createManual(input: AdjustmentManualCreateInput): Observable<AdjustmentManualResultModel> {
    return this.api.createManual(input);
  }
}
