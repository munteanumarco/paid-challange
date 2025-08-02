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
    console.log('Loading stored auth state...');
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('accessToken');
    
    console.log('Stored user:', user);
    console.log('Stored token:', token ? 'exists' : 'none');
    
    if (user && token) {
      console.log('Found stored credentials, restoring auth state');
      this.currentUserSubject.next(JSON.parse(user));
      this.accessTokenSubject.next(token);
    } else {
      console.log('No stored credentials found');
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

  async handleGoogleCallback(code: string, state: string = 'login'): Promise<AuthResponse> {
    console.log('Handling Google callback with code');
    const response = await this.http.post<AuthResponse>(`${this.apiUrl}/auth/exchange-code`, { code, state }).toPromise();
    
    if (!response) {
      throw new Error('No response from server');
    }

    console.log('Received auth response:', response);
    // Only update auth state for login flow, not for connect flow
    if (!state.startsWith('connect_')) {
      await this.handleAuthResponse(response);
    }
    
    return response;
  }

  async handleDirectCallback(params: any): Promise<AuthResponse> {
    console.log('Handling direct callback with params:', params);
    
    if (!params.access_token) {
      throw new Error('No access token received');
    }

    const response: AuthResponse = {
      access_token: params.access_token,
      token_type: params.token_type || 'bearer',
      gmail_account_id: parseInt(params.gmail_account_id),
      message: params.message
    };

    try {
      await this.handleAuthResponse(response);
      
      // Verify auth state
      const isAuth = this.isAuthenticated();
      console.log('Auth state after direct callback:', isAuth ? 'authenticated' : 'not authenticated');
      
      if (!isAuth) {
        throw new Error('Failed to establish auth state after callback');
      }
      
      return response;
    } catch (error) {
      console.error('Error handling direct callback:', error);
      this.logout(); // Clear any partial auth state
      throw error;
    }
  }

  private async handleAuthResponse(response: AuthResponse): Promise<void> {
    console.log('Handling auth response');
    
    // Clear any existing auth state
    this.logout();
    
    // Set the new token
    localStorage.setItem('accessToken', response.access_token);
    this.accessTokenSubject.next(response.access_token);
    
    try {
      // Fetch user data
      const user = await this.http.get<User>(`${this.apiUrl}/auth/me`).toPromise();
      
      if (!user) {
        throw new Error('No user data received');
      }
      
      console.log('Received user info:', user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      
      // Verify auth state
      const isAuth = this.isAuthenticated();
      console.log('Auth state after user fetch:', isAuth ? 'authenticated' : 'not authenticated');
      
      if (!isAuth) {
        throw new Error('Auth state not established after user fetch');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      this.logout();
      throw error;
    }
  }

  fetchCurrentUser(): Observable<User> {
    console.log('Fetching current user');
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        console.log('Received user info:', user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
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
    const hasUser = !!this.currentUserSubject.value;
    const hasToken = !!this.accessTokenSubject.value;
    console.log('Auth check - User:', hasUser, 'Token:', hasToken);
    return hasUser && hasToken;
  }

  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }
}