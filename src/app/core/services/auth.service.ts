import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** Access token held in memory only — never written to localStorage/sessionStorage. */
  private accessToken: string | null = null;
  private currentUserId: string | null = null;
  private currentOrgId: string | null = null;
  private currentRoles: string[] = [];

  constructor(private http: HttpClient) {}

  setAccessToken(token: string): void {
    this.accessToken = token;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload.sub ?? null;
      this.currentOrgId = payload.organizationId ?? null;
      this.currentRoles = payload.role ? [payload.role] : [];
    } catch {
      this.currentUserId = null;
      this.currentOrgId = null;
      this.currentRoles = [];
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  getCurrentOrgId(): string | null {
    return this.currentOrgId;
  }

  getRoles(): string[] {
    return this.currentRoles;
  }

  hasRole(role: string): boolean {
    return this.currentRoles.includes(role);
  }

  /**
   * Clears the in-memory access token and all decoded claims.
   * Called by AuthInterceptor on unrecoverable 401; callers handle navigation.
   */
  logout(): void {
    this.accessToken = null;
    this.currentUserId = null;
    this.currentOrgId = null;
    this.currentRoles = [];
  }

  /**
   * Exchanges the HttpOnly refresh-token cookie for a new access token.
   * withCredentials: true is required so the browser sends the cookie.
   * The raw refresh token is never read or stored by Angular.
   */
  refreshToken(): Observable<string> {
    return this.http.post<{ token: string }>(
      '/auth/refresh',
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.setAccessToken(response.token);
      }),
      map(response => response.token)
    );
  }
}
