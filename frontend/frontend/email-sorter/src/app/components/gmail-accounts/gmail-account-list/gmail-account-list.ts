import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { GmailAccountService, GmailAccount } from '../../../services/gmail-account.service';
import { RefreshService } from '../../../services/refresh.service';

@Component({
  selector: 'app-gmail-account-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './gmail-account-list.html',
  styleUrls: ['./gmail-account-list.scss']
})
export class GmailAccountListComponent implements OnInit {
  accounts: GmailAccount[] = [];
  isLoading = true;
  isConnecting = false;
  isSyncing: { [key: number]: boolean } = {};
  isSyncingAll = false;

  get sortedAccounts(): GmailAccount[] {
    return [...this.accounts].sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return 0;
    });
  }

  constructor(
    private gmailAccountService: GmailAccountService,
    private snackBar: MatSnackBar,
    private refreshService: RefreshService
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.isLoading = true;
    this.gmailAccountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.snackBar.open('Failed to load Gmail accounts', 'Dismiss', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  async connectNewAccount() {
    try {
      this.isConnecting = true;
      await this.gmailAccountService.connectAccount();
    } catch (error) {
      console.error('Error connecting account:', error);
      this.snackBar.open('Failed to start Gmail connection', 'Dismiss', { duration: 3000 });
      this.isConnecting = false;
    }
  }

  syncAccount(account: GmailAccount) {
    this.isSyncing[account.id] = true;
    this.gmailAccountService.syncAccount(account.id).subscribe({
      next: () => {
        this.isSyncing[account.id] = false;
        this.snackBar.open('Gmail account synced successfully', 'Dismiss', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadAccounts(); // Refresh to get updated sync time
        this.refreshService.triggerCategoriesRefresh(); // Update category email counts
      },
      error: (error) => {
        console.error('Error syncing account:', error);
        this.isSyncing[account.id] = false;
        this.snackBar.open('Failed to sync Gmail account', 'Dismiss', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  syncAllAccounts() {
    this.isSyncingAll = true;
    this.gmailAccountService.syncAllAccounts().subscribe({
      next: () => {
        this.isSyncingAll = false;
        this.snackBar.open('All Gmail accounts sync triggered successfully', 'Dismiss', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadAccounts(); // Refresh to get updated sync times
        this.refreshService.triggerCategoriesRefresh(); // Update category email counts
      },
      error: (error) => {
        console.error('Error syncing all accounts:', error);
        this.isSyncingAll = false;
        this.snackBar.open('Failed to sync all Gmail accounts', 'Dismiss', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}