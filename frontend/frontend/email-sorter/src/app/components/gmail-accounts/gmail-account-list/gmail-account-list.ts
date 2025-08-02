import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GmailAccountService, GmailAccount } from '../../../services/gmail-account.service';

@Component({
  selector: 'app-gmail-account-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="section-header">
      <h2>Connected Gmail Accounts</h2>
    </div>

    <div class="account-list" *ngIf="!isLoading; else loading">
      <div class="account-item" *ngFor="let account of accounts">
        <div class="account-info">
          <mat-icon class="account-icon">mail</mat-icon>
          <div class="account-details">
            <div class="account-email">{{ account.email }}</div>
            <div class="account-sync">Last synced: {{ account.last_sync_time | date:'medium' }}</div>
          </div>
        </div>
        <div class="account-actions">
          <button mat-icon-button color="primary" (click)="syncAccount(account)" [disabled]="isSyncing[account.id]">
            <mat-icon>
              <mat-spinner diameter="20" *ngIf="isSyncing[account.id]; else syncIcon"></mat-spinner>
              <ng-template #syncIcon>sync</ng-template>
            </mat-icon>
          </button>
        </div>
      </div>

      <button mat-button color="primary" (click)="connectNewAccount()" [disabled]="isConnecting" class="add-account-button">
        <mat-icon>add</mat-icon>
        Connect Gmail Account
      </button>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading accounts...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      padding: 24px;
    }

    .section-header {
      margin-bottom: 24px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: #1a73e8;
      }
    }

    .account-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .account-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: background-color 0.2s;

      &:hover {
        background: #f1f3f4;
      }
    }

    .account-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .account-icon {
      color: #1a73e8;
    }

    .account-details {
      .account-email {
        font-weight: 500;
        color: #202124;
      }

      .account-sync {
        font-size: 12px;
        color: #5f6368;
        margin-top: 4px;
      }
    }

    .account-actions {
      display: flex;
      gap: 8px;
    }

    .add-account-button {
      margin-top: 8px;
      color: #1a73e8;
      font-weight: 500;

      mat-icon {
        margin-right: 8px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 32px;
      color: #5f6368;
    }
  `]
})
export class GmailAccountListComponent implements OnInit {
  accounts: GmailAccount[] = [];
  isLoading = true;
  isConnecting = false;
  isSyncing: { [key: number]: boolean } = {};

  constructor(
    private gmailAccountService: GmailAccountService,
    private snackBar: MatSnackBar
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
        this.snackBar.open('Gmail account synced successfully', 'Dismiss', { duration: 3000 });
        this.loadAccounts(); // Refresh to get updated sync time
      },
      error: (error) => {
        console.error('Error syncing account:', error);
        this.isSyncing[account.id] = false;
        this.snackBar.open('Failed to sync Gmail account', 'Dismiss', { duration: 3000 });
      }
    });
  }
}