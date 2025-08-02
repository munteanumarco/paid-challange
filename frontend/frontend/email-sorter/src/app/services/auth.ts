import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  gmail_account_id: number;
  message?: string;  // For connect account response
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private accessTokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('accessToken');
    
    if (user && token) {
      this.currentUserSubject.next(JSON.parse(user));
      this.accessTokenSubject.next(token);
    }
  }

  async initiateGoogleLogin(): Promise<void> {
    try {
      console.log('Initiating Google login');
      const response = await this.http.get<{url: string}>(`${this.apiUrl}/auth/google-auth-url`).toPromise();
      console.log('Received auth URL:', response);
      
      if (response?.url) {
        localStorage.setItem('returnUrl', window.location.pathname);
        window.location.href = response.url;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      throw error;
    }
  }

  async initiateGoogleConnect(): Promise<void> {
    try {
      console.log('Initiating Google account connection');
      const response = await this.http.get<{url: string}>(
        `${this.apiUrl}/auth/google-auth-url?connect_account=true`
      ).toPromise();

      if (response?.url) {
        localStorage.setItem('returnUrl', window.location.pathname);
        window.location.href = response.url;
      } else {
        throw new Error('No connect URL received');
      }
    } catch (error) {
      console.error('Failed to get connect URL:', error);
      throw error;
    }
  }

  handleGoogleCallback(code: string, state: string = 'login'): Observable<AuthResponse> {
    console.log('Handling Google callback with code');
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/exchange-code`, { code, state }).pipe(
      tap(response => {
        console.log('Received auth response:', response);
        // Only update auth state for login flow, not for connect flow
        if (!state.startsWith('connect_')) {
          this.handleAuthResponse(response);
        }
      })
    );
  }

  handleDirectCallback(params: any): Observable<AuthResponse> {
    console.log('Handling direct callback with params:', params);
    const response: AuthResponse = {
      access_token: params.access_token,
      token_type: params.token_type,
      gmail_account_id: parseInt(params.gmail_account_id),
      message: params.message
    };

    return new Observable(observer => {
      try {
        // Only update auth state if this is not a connect flow
        if (!params.message?.includes('connected')) {
          this.handleAuthResponse(response);
        }
        observer.next(response);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private handleAuthResponse(response: AuthResponse): void {
    console.log('Handling auth response');
    localStorage.setItem('accessToken', response.access_token);
    this.accessTokenSubject.next(response.access_token);
    this.fetchCurrentUser();
  }

  private fetchCurrentUser(): void {
    console.log('Fetching current user');
    if (this.accessTokenSubject.value) {
      this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
        next: (user) => {
          console.log('Received user info:', user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        },
        error: (error) => {
          console.error('Failed to fetch user info:', error);
          this.logout();
        }
      });
    }
  }

  logout(): void {
    console.log('Logging out');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('returnUrl');
    this.currentUserSubject.next(null);
    this.accessTokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.currentUserSubject.value && !!this.accessTokenSubject.value;
    console.log('Checking authentication:', isAuth);
    return isAuth;
  }

  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }
}