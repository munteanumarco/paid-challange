import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GmailAccount {
  id: number;
  email: string;
  google_id: string;
  last_sync_time: string;
  is_active: boolean;
  is_primary: boolean;  // Added this field
}

@Injectable({
  providedIn: 'root'
})
export class GmailAccountService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<GmailAccount[]> {
    return this.http.get<GmailAccount[]>(`${this.apiUrl}/gmail-accounts`);
  }

  async connectAccount(): Promise<void> {
    try {
      // Get the auth URL with connect_account=true
      const response = await this.http.get<{url: string}>(`${this.apiUrl}/auth/google-auth-url?connect_account=true`).toPromise();
      if (response?.url) {
        // Store current URL to return to after connection
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

  syncAccount(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/gmail-accounts/${id}/sync`, {});
  }

  syncAllAccounts(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/gmail-accounts/sync-all`, {});
  }
}