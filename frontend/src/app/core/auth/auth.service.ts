import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  email: string;
  fullName: string;
}

interface PersistedAuthState {
  user: AuthUser | null;
  token: string | null;
}

// localStorage keeps the session across tabs and browser restarts. Swap for
// sessionStorage if you'd rather the session end when the tab closes.
const AUTH_STORE_KEY = 'cleanstart:auth';

/// Holds the logged-in user + JWT in signals and mirrors it to localStorage. The
/// interceptor and route guard both read from this service — it's the single source
/// of truth for "who is logged in" on the client.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  constructor() {
    this.restore();
  }

  login(user: AuthUser, token: string): void {
    this._user.set(user);
    this._token.set(token);
    this.persist();
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem(AUTH_STORE_KEY);
  }

  private persist(): void {
    const state: PersistedAuthState = { user: this._user(), token: this._token() };
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(state));
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(AUTH_STORE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedAuthState;
      this._user.set(parsed.user ?? null);
      this._token.set(parsed.token ?? null);
    } catch {
      // Corrupt or missing state — start logged out rather than throwing.
    }
  }
}
