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
    // Load saved auth state
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
      // First get the auth URL from our backend
      const response = await this.http.get<{url: string}>(`${this.apiUrl}/auth/google-auth-url`).toPromise();
      console.log('Received auth URL:', response);
      
      if (response?.url) {
        // Store current URL to return to after login
        localStorage.setItem('returnUrl', window.location.pathname);
        // Redirect to Google's auth page
        window.location.href = response.url;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      throw error;
    }
  }

  handleGoogleCallback(code: string): Observable<AuthResponse> {
    console.log('Handling Google callback with code');
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/exchange-code`, { code }).pipe(
      tap(response => {
        console.log('Received auth response:', response);
        this.handleAuthResponse(response);
      })
    );
  }

  handleDirectCallback(params: any): Observable<any> {
    console.log('Handling direct callback with params:', params);
    // Handle the direct response from backend redirect
    const response: AuthResponse = {
      access_token: params.access_token,
      token_type: params.token_type,
      gmail_account_id: parseInt(params.gmail_account_id)
    };
    
    return new Observable(observer => {
      try {
        this.handleAuthResponse(response);
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
    
    // After getting the token, fetch user info
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
    // Clear all auth data
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