import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingGridComponent } from './booking.grid.component';

const routes: Routes = [
  {
    path: '',
    component: BookingGridComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingGridRoutingModule { }
