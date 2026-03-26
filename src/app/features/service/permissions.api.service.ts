import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';

import { API } from '@core/api/api.config';
import { PermissionOptionApiModel, PermissionOptionModel, mapPermissionOptionApiModel } from '@models/groups.models';

@Injectable({ providedIn: 'root' })
export class PermissionsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1/permissions`;

  getOptions() {
    return this.http
      .get<PermissionOptionApiModel[]>(`${this.baseUrl}/options`)
      .pipe(map((items) => (items ?? []).map(mapPermissionOptionApiModel) as PermissionOptionModel[]));
  }
}
