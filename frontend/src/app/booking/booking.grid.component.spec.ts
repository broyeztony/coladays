import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import {BookingGridComponent} from './booking.grid.component';
import {BookingService} from '../services/BookingService';
import {UtilsService} from '../services/UtilsService';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule} from '@angular/common';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {BookingGridRoutingModule} from './booking.grid.routing.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AuthModule, AuthService} from '@auth0/auth0-angular';

describe('BookingGridComponent', () => {
  let component: BookingGridComponent;
  let fixture: ComponentFixture<BookingGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookingGridComponent],
      providers: [
        AuthService,
        BookingService,
        UtilsService,
        MatSnackBar,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: FormBuilder, useValue: {} }
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
        MatSnackBarModule,
        AuthModule.forRoot({
          domain: 'coladays.eu.auth0.com',
          clientId: 'qN1VaZhZagfXERftH6AV3ZPfBr3dYL5H'
        }),
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
