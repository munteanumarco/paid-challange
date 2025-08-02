import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { EmailService, Email } from '../../../services/email';
import { CategoryService, Category } from '../../../services/category';
import { EmailViewDialogComponent } from '../../emails/email-view-dialog/email-view-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-category-emails',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './category-emails.html',
  styleUrls: ['./category-emails.scss']
})
export class CategoryEmailsComponent implements OnInit {
  category?: Category;
  emails: Email[] = [];
  isLoading = true;
  selectedEmails = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private emailService: EmailService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const categoryId = Number(this.route.snapshot.paramMap.get('id'));
    if (categoryId) {
      this.loadCategory(categoryId);
      this.loadEmails(categoryId);
    }
  }

  private loadCategory(id: number) {
    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.snackBar.open('Failed to load category', 'Dismiss', { duration: 3000 });
      }
    });
  }

  private loadEmails(categoryId: number) {
    this.isLoading = true;
    this.emailService.getEmails(categoryId).subscribe({
      next: (emails) => {
        this.emails = emails;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading emails:', error);
        this.snackBar.open('Failed to load emails', 'Dismiss', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleEmailSelection(emailId: number) {
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
  }

  selectAllEmails() {
    if (this.selectedEmails.size === this.emails.length) {
      this.selectedEmails.clear();
    } else {
      this.selectedEmails = new Set(this.emails.map(e => e.id));
    }
  }

  deleteSelectedEmails() {
    if (this.selectedEmails.size === 0) return;

    const emailCount = this.selectedEmails.size;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete ${emailCount} ${emailCount === 1 ? 'email' : 'emails'}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const emailIds = Array.from(this.selectedEmails);
        this.emailService.bulkDeleteEmails(emailIds).subscribe({
          next: () => {
            this.snackBar.open('Emails deleted successfully', '', { 
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['success-snackbar']
            });
            this.selectedEmails.clear();
            this.loadEmails(this.category!.id);
          },
          error: (error) => {
            console.error('Error deleting emails:', error);
            this.snackBar.open('Failed to delete emails', '', { 
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  viewEmail(email: Email, event: MouseEvent) {
    // Don't trigger if clicking the checkbox
    if ((event.target as HTMLElement).closest('.email-checkbox')) {
      return;
    }

    this.dialog.open(EmailViewDialogComponent, {
      data: email,
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }
}