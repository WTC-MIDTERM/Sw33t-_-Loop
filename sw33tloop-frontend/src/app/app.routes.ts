import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Menu } from './pages/menu/menu';
import { Contact } from './pages/contact/contact';
import { Team } from './pages/team/team';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'menu', component: Menu },
  { path: 'contact', component: Contact },
  { path: 'team', component: Team },
  { path: '**', redirectTo: '' }
];