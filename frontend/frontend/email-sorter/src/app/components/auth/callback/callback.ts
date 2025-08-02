import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <mat-spinner></mat-spinner>
      <p>{{ error || 'Completing sign in...' }}</p>
    </div>
  `,
  styles: [`
    .callback-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      
      p {
        color: #5f6368;
      }
    }
  `]
})
export class CallbackComponent implements OnInit {
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    console.log('Callback component initialized');
    
    try {
      // Subscribe to query params instead of using toPromise
      this.route.queryParams.subscribe(async params => {
        console.log('Query params:', params);
        
        if (!params) {
          throw new Error('No query parameters received');
        }

        const accessToken = params['access_token'];
        const code = params['code'];
        const error = params['error'];
        
        try {
          if (accessToken) {
            // If we got the token directly from the backend redirect
            console.log('Received access token from backend redirect');
            await this.authService.handleDirectCallback(params);
            console.log('Direct callback handled successfully');
            
            // Navigate to dashboard after successful auth
            await this.router.navigate(['/dashboard']);
          } else if (code) {
            // If we got the authorization code
            console.log('Received authorization code');
            await this.authService.handleGoogleCallback(code);
            console.log('Code exchange successful');
            
            // Navigate to dashboard after successful auth
            await this.router.navigate(['/dashboard']);
          } else if (error) {
            throw new Error(error);
          } else {
            throw new Error('No authentication code received');
          }
        } catch (error) {
          console.error('Error during auth callback:', error);
          this.error = error instanceof Error ? error.message : 'Authentication failed';
          this.authService.logout();
          setTimeout(() => this.router.navigate(['/login']), 3000);
        }
      });
    } catch (error) {
      console.error('Authentication error:', error);
      this.error = error instanceof Error ? error.message : 'Failed to complete authentication. Please try again.';
      
      // Clear any partial auth state
      this.authService.logout();
      
      setTimeout(() => this.router.navigate(['/login']), 3000);
    }
  }
}