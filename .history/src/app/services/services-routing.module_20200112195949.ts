import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServicesPage } from './services.page';

const routes: Routes = [
  { path: '', redirectTo: 'discover', pathMatch: 'full' },
  {
    path: 'discover',
    loadChildren: () => import('./discover/discover.module').then( m => m.DiscoverPageModule)
  },
  {
    path: 'offers',
    loadChildren: () => import('./offers/offers.module').then( m => m.OffersPageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then( m => m.CategoriesPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesPageRoutingModule {}
