import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('Login component initialized');
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('Is authenticated:', this.isAuthenticated);

    if (this.isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      this.router.navigate(['/']);
    }
  }

  async login() {
    try {
      console.log('Starting login process');
      this.isLoading = true;
      this.error = null;
      await this.authService.initiateGoogleLogin();
    } catch (error) {
      console.error('Login error:', error);
      this.isLoading = false;
      this.error = 'Failed to start authentication. Please try again.';
    }
  }
}