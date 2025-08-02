import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService, Category } from '../../../services/category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  categoryId?: number;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.categoryId) {
      this.isEditing = true;
      this.loadCategory(this.categoryId);
    }
  }

  private loadCategory(id: number) {
    this.categoryService.getCategory(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description
        });
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.snackBar.open('Failed to load category', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/categories']);
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const categoryData = this.categoryForm.value;
      
      const request = this.isEditing && this.categoryId
        ? this.categoryService.updateCategory(this.categoryId, categoryData)
        : this.categoryService.createCategory(categoryData);

      request.subscribe({
        next: () => {
          const message = this.isEditing ? 'Category updated successfully' : 'Category created successfully';
          this.snackBar.open(message, '', { 
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error saving category:', error);
          this.snackBar.open('Failed to save category', '', { 
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}