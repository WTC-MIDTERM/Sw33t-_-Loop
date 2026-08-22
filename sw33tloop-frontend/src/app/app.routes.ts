import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Menu } from './pages/menu/menu';
import { Contact } from './pages/contact/contact';
import { Team } from './pages/team/team';
import { CartPage } from './pages/cart-page/cart-page';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Admin } from './pages/admin/admin';
import { AdminLogin } from './pages/admin-login/admin-login';
import { adminGuardGuard } from './core/admin-guard-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'menu', component: Menu },
  { path: 'contact', component: Contact },
  { path: 'team', component: Team },
  { path: 'cart', component: CartPage },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin', component: Admin, canActivate: [adminGuardGuard] },
  { path: '**', redirectTo: '' }
];