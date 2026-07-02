import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

export interface EmailSettingsModel {
  impl: string;
  fromName: string;
  fromEmail: string;
  brevoApiKey: string | null;
  brevoBaseUrl: string | null;
}

export interface EmailSettingsRequest {
  impl: string;
  fromName: string;
  fromEmail: string;
  brevoApiKey: string | null;
  brevoBaseUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmailSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.bffBaseUrl}/bff/v1/email/settings`;

  getSettings(): Observable<EmailSettingsModel> {
    return this.http.get<EmailSettingsModel>(this.baseUrl);
  }

  updateSettings(request: EmailSettingsRequest): Observable<EmailSettingsModel> {
    return this.http.put<EmailSettingsModel>(this.baseUrl, request);
  }
}
