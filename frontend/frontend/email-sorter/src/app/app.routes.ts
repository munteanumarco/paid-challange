import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { CallbackComponent } from './components/auth/callback/callback';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CategoryListComponent } from './components/categories/category-list/category-list';
import { CategoryFormComponent } from './components/categories/category-form/category-form';
import { CategoryEmailsComponent } from './components/categories/category-emails/category-emails';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { gmailAccountGuard } from './guards/gmail-account.guard';
import { AddGmailAccountComponent } from './components/gmail-accounts/add-gmail-account/add-gmail-account';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'auth/callback',
    component: CallbackComponent
  },
  {
    path: 'add-gmail-account',
    component: AddGmailAccountComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, gmailAccountGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            component: CategoryListComponent
          },
          {
            path: 'new',
            component: CategoryFormComponent
          },
          {
            path: ':id/edit',
            component: CategoryFormComponent
          },
          {
            path: ':id/emails',
            component: CategoryEmailsComponent
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];