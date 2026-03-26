import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map } from 'rxjs';

import { API } from '@core/api/api.config';
import { HalPagedResponse } from '@core/api/page.model';
import type { EmailLogModel } from '../models/email-log.models';
import { EmailLogsFilters } from '@features/filter/email-logs.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';

@Injectable({ providedIn: 'root' })
export class EmailLogsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API.bff}/v1`;

  searchPaged(body: ListQueryDto<EmailLogsFilters>) {
    return this.http.post<HalPagedResponse<EmailLogModel>>(`${this.baseUrl}/email-logs`, body).pipe(
      map(
        (res) =>
          ({
            ...res,
            content: res?._embedded?.content,
          }) as HalPagedResponse<EmailLogModel>,
      ),
    );
  }
}
