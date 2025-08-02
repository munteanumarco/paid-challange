import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Email } from '../../../services/email';

@Component({
  selector: 'app-email-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="email-dialog">
      <div class="email-header">
        <div class="email-subject">{{ data.subject }}</div>
        <button mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="email-metadata">
        <div class="email-from">
          <strong>From:</strong> {{ data.sender }}
        </div>
        <div class="email-to" *ngIf="data.gmail_account?.email">
          <strong>To:</strong> {{ data.gmail_account?.email }}
        </div>
        <div class="email-date">
          <strong>Received:</strong> {{ data.received_at | date:'medium' }}
        </div>
      </div>

      <mat-dialog-content>
        <div class="email-summary" *ngIf="data.summary">
          <div class="summary-label">AI Summary:</div>
          <div class="summary-content">{{ data.summary }}</div>
        </div>

        <div class="email-content">
          <div class="content-label">Original Email:</div>
          <div class="content-body" [innerHTML]="data.content"></div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .email-dialog {
      padding: 0;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .email-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .email-subject {
      font-size: 20px;
      font-weight: 500;
      color: #202124;
      margin-right: 16px;
    }

    .email-metadata {
      padding: 16px 24px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      
      .email-from, .email-to, .email-date {
        margin-bottom: 8px;
        color: #5f6368;
        line-height: 1.5;
        
        strong {
          color: #202124;
          min-width: 80px;
          display: inline-block;
        }
      }
    }

    mat-dialog-content {
      margin: 0;
      padding: 24px;
      max-height: none;
    }

    .email-summary {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e0e0e0;

      .summary-label {
        font-weight: 500;
        color: #1a73e8;
        margin-bottom: 8px;
      }

      .summary-content {
        line-height: 1.5;
        color: #202124;
      }
    }

    .email-content {
      .content-label {
        font-weight: 500;
        color: #1a73e8;
        margin-bottom: 8px;
      }

      .content-body {
        line-height: 1.5;
        color: #202124;
        white-space: pre-wrap;
      }
    }

    mat-dialog-actions {
      padding: 8px 24px;
      margin: 0;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class EmailViewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EmailViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Email
  ) {}
}