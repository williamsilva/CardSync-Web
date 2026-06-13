import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from 'environments/environment';
import {
  ManagementDashboardFilters,
  ManagementDashboardModel,
} from '@models/management-dashboard.models';

@Injectable({ providedIn: 'root' })
export class ManagementDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/management`;

  getDashboard(filters: ManagementDashboardFilters): Observable<ManagementDashboardModel> {
    return this.http.post<ManagementDashboardModel>(`${this.baseUrl}/dashboard`, filters, {
      withCredentials: true,
    });
  }
}
