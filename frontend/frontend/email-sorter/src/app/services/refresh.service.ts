import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private refreshCategoriesSource = new Subject<void>();
  refreshCategories$ = this.refreshCategoriesSource.asObservable();

  triggerCategoriesRefresh() {
    this.refreshCategoriesSource.next();
  }
}