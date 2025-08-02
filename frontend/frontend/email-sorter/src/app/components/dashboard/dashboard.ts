import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { GmailAccountListComponent } from '../gmail-accounts/gmail-account-list/gmail-account-list';
import { CategoryListComponent } from '../categories/category-list/category-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    GmailAccountListComponent,
    CategoryListComponent
  ],
  template: `
    <div class="dashboard-container">
      <section class="section-container">
        <app-gmail-account-list></app-gmail-account-list>
      </section>
      
      <section class="section-container">
        <app-category-list></app-category-list>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class DashboardComponent {}