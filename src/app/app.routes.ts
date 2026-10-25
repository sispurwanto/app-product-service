import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AdministratorComponent } from './pages/administrator/administrator';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'WebCare & Custom - Layanan Perbaikan, Perawatan & Fitur Website'
  },
  {
    path: 'administrator',
    component: AdministratorComponent,
    title: 'Administrator Portal - WebCare'
  },
  {
    path: 'admin',
    redirectTo: 'administrator',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
