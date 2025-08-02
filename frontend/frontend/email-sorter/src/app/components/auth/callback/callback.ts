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

  ngOnInit() {
    console.log('Callback component initialized');
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      
      if (params['access_token']) {
        // If we got the token directly from the backend redirect
        console.log('Received access token from backend redirect');
        this.authService.handleDirectCallback(params).subscribe({
          next: () => {
            console.log('Direct callback handled successfully');
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Direct callback error:', error);
            this.error = 'Failed to complete authentication. Please try again.';
            setTimeout(() => this.router.navigate(['/login']), 3000);
          }
        });
      } else if (params['code']) {
        // If we got the authorization code
        console.log('Received authorization code');
        this.authService.handleGoogleCallback(params['code']).subscribe({
          next: () => {
            console.log('Code exchange successful');
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Authentication error:', error);
            this.error = 'Failed to complete authentication. Please try again.';
            setTimeout(() => this.router.navigate(['/login']), 3000);
          }
        });
      } else if (params['error']) {
        console.error('Received error:', params['error']);
        this.error = params['error'];
        setTimeout(() => this.router.navigate(['/login']), 3000);
      } else {
        console.error('No code or token received');
        this.error = 'No authentication code received';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      }
    });
  }
}