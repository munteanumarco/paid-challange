import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { GmailAccountService } from '../services/gmail-account.service';
import { map, catchError, of } from 'rxjs';

export const gmailAccountGuard = () => {
  const gmailAccountService = inject(GmailAccountService);
  const router = inject(Router);

  return gmailAccountService.getAccounts().pipe(
    map(accounts => {
      if (accounts.length > 0) {
        return true;
      }
      router.navigate(['/add-gmail-account']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/add-gmail-account']);
      return of(false);
    })
  );
};