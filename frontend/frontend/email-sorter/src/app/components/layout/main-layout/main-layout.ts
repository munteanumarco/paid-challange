import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './main-layout.html',
  styles: [`
    .layout-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;

      .toolbar-spacer {
        flex: 1 1 auto;
      }

      mat-toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 2;
        background-color: #1a73e8;
        color: white;

        .app-title {
          color: white;
          text-decoration: none;
          font-size: 20px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.9;
          }
        }
      }

      .main-content {
        margin-top: 64px; // Height of toolbar
        flex: 1;
        min-height: calc(100vh - 64px);
      }
    }
  `]
})
export class MainLayoutComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}