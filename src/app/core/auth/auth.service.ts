import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { MeStore } from './me.store';
import { API } from '../api/api.config';
import { BffMeResponse } from './models';
import { CsrfService } from '../api/csrf.service';
import { SessionService } from './session.service';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private meLoadPromise: Promise<BffMeResponse | null> | null = null;
  private loginRedirectInFlight = false;

  private readonly http = inject(HttpClient);
  private readonly meStore = inject(MeStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly csrf = inject(CsrfService);

  isAuthenticated(): boolean {
    return this.meStore.isAuthenticated();
  }

  async loadMe(): Promise<BffMeResponse | null> {
    try {
      const me = await firstValueFrom(
        this.http.get<BffMeResponse>(`${API.bff}/me`, { withCredentials: true }),
      );

      if (me?.authenticated) {
        this.meStore.setMe(me);
        this.session.start(me.expiresAt ?? null);
        this.loginRedirectInFlight = false;
        return me;
      }

      this.meStore.setMe(null);
      this.session.stop();
      return null;
    } catch {
      this.meStore.setMe(null);
      this.session.stop();
      return null;
    }
  }

  async renewSession(): Promise<boolean> {
    const me = await this.loadMe();
    return !!me?.authenticated;
  }

  async ensureSessionChecked(): Promise<boolean> {
    if (this.meStore.isAuthenticated()) return true;

    if (!this.meLoadPromise) {
      this.meLoadPromise = this.loadMe().finally(() => {
        this.meLoadPromise = null;
      });
    }

    const me = await this.meLoadPromise;
    return !!me?.authenticated;
  }

  static readonly RETURN_URL_KEY = 'cs_return_url';

  async startLogin(targetUrl?: string): Promise<void> {
    if (this.loginRedirectInFlight) {
      return;
    }

    this.loginRedirectInFlight = true;

    const target = targetUrl ?? this.router.url ?? '/';
    const pathOnly = this.toRelativeSpaPath(target);

    sessionStorage.setItem(AuthService.RETURN_URL_KEY, pathOnly);

    window.location.href = `${environment.bffBaseUrl}/bff/login`;
  }

  consumeReturnUrl(): string | null {
    const url = sessionStorage.getItem(AuthService.RETURN_URL_KEY);
    if (url) sessionStorage.removeItem(AuthService.RETURN_URL_KEY);
    return url;
  }

  async logout(): Promise<void> {
    await this.csrf.ensureCsrfCookie();

    // Fallback caso a chamada falhe: reinicia o fluxo OAuth2 (mesmo destino do startLogin).
    let logoutUrl = `${environment.bffBaseUrl}/bff/login`;

    try {
      const res = await firstValueFrom(
        this.http.post<{ logoutUrl: string }>(`${API.bff}/logout`, {}, { withCredentials: true }),
      );
      if (res?.logoutUrl) {
        logoutUrl = res.logoutUrl;
      }
    } catch {
      // mantém o fallback acima
    } finally {
      this.meStore.setMe(null);
      this.session.stop();
      this.meLoadPromise = null;
      this.loginRedirectInFlight = false;
      sessionStorage.removeItem('cs_login_redirect_lock');
      sessionStorage.removeItem(AuthService.RETURN_URL_KEY);
    }

    // logoutUrl aponta pro RP-Initiated Logout do NimbusAuth (/connect/logout), que encerra
    // a sessão de login de lá também - sem isso, o NimbusAuth ficava logado e o próximo
    // /oauth2/authorize reautenticava via SSO silenciosamente (logout "não funcionava").
    window.location.href = logoutUrl;
  }

  private toRelativeSpaPath(url: string): string {
    const parsed = new URL(url, window.location.origin);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }
}
