import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GmailAccountService } from '../../../services/gmail-account.service';

@Component({
  selector: 'app-add-gmail-account',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <button mat-raised-button color="primary" (click)="connectAccount()" [disabled]="isConnecting">
      <mat-icon>add</mat-icon>
      {{ isConnecting ? 'Connecting...' : 'Connect Gmail Account' }}
    </button>
  `,
  styles: [`
    :host {
      display: block;
    }

    button {
      width: 100%;
      padding: 8px 16px;
      
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class AddGmailAccountComponent {
  isConnecting = false;

  constructor(
    private gmailAccountService: GmailAccountService,
    private snackBar: MatSnackBar
  ) {}

  async connectAccount() {
    try {
      this.isConnecting = true;
      await this.gmailAccountService.connectAccount();
    } catch (error) {
      console.error('Error connecting account:', error);
      this.snackBar.open('Failed to start Gmail connection', 'Dismiss', { duration: 3000 });
      this.isConnecting = false;
    }
  }
}