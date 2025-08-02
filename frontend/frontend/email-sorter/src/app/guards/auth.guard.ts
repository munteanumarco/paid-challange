import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Auth guard running for route:', router.url);

  // Check if we're already authenticated
  if (authService.isAuthenticated()) {
    console.log('User is authenticated, allowing access');
    return true;
  }

  // Check if we have a token but no user (might be loading)
  const token = localStorage.getItem('accessToken');
  console.log('Token check:', token ? 'found' : 'not found');

  if (token) {
    console.log('Found token, attempting to fetch user data');
    // Try to fetch user data
    authService.fetchCurrentUser().subscribe({
      next: () => {
        console.log('User data fetched successfully');
        if (authService.isAuthenticated()) {
          console.log('Auth restored, retrying route:', router.url);
          router.navigate([router.url]); // Retry the same route
        } else {
          console.log('Auth failed after user fetch, redirecting to login');
          router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Failed to fetch user data:', error);
        router.navigate(['/login']);
      }
    });
    return false;
  }

  console.log('No auth found, redirecting to login');
  router.navigate(['/login']);
  return false;
};