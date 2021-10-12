import {BookingGridComponent} from './booking.grid.component';
import {NgModule} from '@angular/core';
import {BookingGridRoutingModule} from './booking.grid.routing.module';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CreateBookingDialogComponent} from './dialog/create.booking/create.booking.dialog.component';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {BookingService} from '../services/BookingService';
import {UtilsService} from '../services/UtilsService';
import {CancelBookingDialogComponent} from './dialog/cancel.booking/cancel.booking.dialog.component';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';


@NgModule({
  declarations: [
    BookingGridComponent,
    CreateBookingDialogComponent,
    CancelBookingDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BookingGridRoutingModule,
    MatGridListModule,
    MatDialogModule,
    MatToolbarModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatListModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  providers: [
    BookingService,
    UtilsService,
    MatSnackBar,
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: FormBuilder, useValue: {} }
  ]
})
export class BookingGridModule { }
