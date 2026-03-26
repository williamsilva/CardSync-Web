import { environment } from '../../../environments/environment';

export const API = {
  bffBaseUrl: environment.bffBaseUrl,
  apiBaseUrl: environment.apiBaseUrl,

  // ✅ prefixos fixos
  bff: `${environment.bffBaseUrl}/bff`,
  api: `${environment.apiBaseUrl}/api`,
} as const;
