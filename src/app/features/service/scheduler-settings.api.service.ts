import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

export interface SchedulerSettingsModel {
  enabled: boolean;
  completePipelineEnabled: boolean;
  completePipelineCron: string;
  completePipelineStopOnStepError: boolean;
  logIdleCycles: boolean;
}

export interface SchedulerSettingsRequest {
  enabled: boolean;
  completePipelineEnabled: boolean;
  completePipelineCron: string;
  completePipelineStopOnStepError: boolean;
  logIdleCycles: boolean;
}

@Injectable({ providedIn: 'root' })
export class SchedulerSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/scheduler/settings`;

  getSettings(): Observable<SchedulerSettingsModel> {
    return this.http.get<SchedulerSettingsModel>(this.baseUrl, { withCredentials: true });
  }

  updateSettings(request: SchedulerSettingsRequest): Observable<SchedulerSettingsModel> {
    return this.http.put<SchedulerSettingsModel>(this.baseUrl, request, {
      withCredentials: true,
    });
  }
}
