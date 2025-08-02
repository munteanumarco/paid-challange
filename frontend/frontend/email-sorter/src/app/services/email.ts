import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Email {
  id: number;
  gmail_id: string;
  subject: string;
  sender: string;
  content: string;
  summary?: string;
  received_at: string;
  category_id?: number;
  gmail_account_id: number;
  is_archived: boolean;
  gmail_account?: {
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  getEmails(categoryId?: number, search?: string, skip = 0, limit = 50): Observable<Email[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (categoryId) {
      params = params.set('category_id', categoryId.toString());
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Email[]>(`${this.apiUrl}/emails`, { params });
  }

  getEmail(id: number): Observable<Email> {
    return this.http.get<Email>(`${this.apiUrl}/emails/${id}`);
  }

  bulkDeleteEmails(emailIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/emails/bulk-delete`, emailIds);
  }
}