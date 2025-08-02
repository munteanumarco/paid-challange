import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="section-header">
      <h2>Email Categories</h2>
    </div>

    <div class="category-list">
      <div class="category-item" *ngFor="let category of categories">
        <div class="category-info">
          <mat-icon class="category-icon">folder</mat-icon>
          <div class="category-details">
            <div class="category-name">{{ category.name }}</div>
            <div class="category-description">{{ category.description }}</div>
          </div>
        </div>
        <div class="category-actions">
          <mat-chip-set>
            <mat-chip>{{ category.email_count }} emails</mat-chip>
          </mat-chip-set>
          <button mat-icon-button color="primary" (click)="editCategory(category.id)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="deleteCategory(category.id)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>

      <button mat-button color="primary" (click)="addCategory()" class="add-category-button">
        <mat-icon>add</mat-icon>
        Add New Category
      </button>
    </div>
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

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .category-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      transition: background-color 0.2s;

      &:hover {
        background: #f1f3f4;
      }
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .category-icon {
      color: #1a73e8;
    }

    .category-details {
      flex: 1;
      min-width: 0;

      .category-name {
        font-weight: 500;
        color: #202124;
        margin-bottom: 4px;
      }

      .category-description {
        font-size: 14px;
        color: #5f6368;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .category-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-chip-set {
        margin-right: 8px;
      }

      button {
        opacity: 0.7;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }
    }

    .add-category-button {
      margin-top: 8px;
      color: #1a73e8;
      font-weight: 500;

      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: any[] = [
    {
      id: 1,
      name: 'Newsletters',
      description: 'Regular newsletters and updates from subscribed services',
      email_count: 25
    },
    {
      id: 2,
      name: 'Shopping',
      description: 'Order confirmations and shipping updates',
      email_count: 12
    }
  ];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    // TODO: Load categories from service
  }

  addCategory() {
    // TODO: Implement add category
  }

  editCategory(id: number) {
    // TODO: Implement edit category
  }

  deleteCategory(id: number) {
    // TODO: Implement delete category
  }
}