import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {BookingGridComponent} from './booking/booking.grid.component';
import {AuthGuard} from '@auth0/auth0-angular';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'booking'
  },
  {
    path: 'booking',
    component: BookingGridComponent,
    loadChildren: async () => (await import('./booking/booking.grid.module')).BookingGridModule,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: BookingGridComponent,
    loadChildren: async () => (await import('./booking/booking.grid.module')).BookingGridModule
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
