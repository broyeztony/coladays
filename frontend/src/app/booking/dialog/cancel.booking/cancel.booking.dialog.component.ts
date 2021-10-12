import {Component, Inject, Optional} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AGClientSocket} from 'socketcluster-client';
import {BookingService} from '../../../services/BookingService';
import {BookingStatus, BookingTransaction, MeetingRoomUnitSlot} from '../../../shared/domain';
import {UtilsService} from '../../../services/UtilsService';
import {BookingDialog} from '../booking.dialog.interface';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSnackBarRef} from '@angular/material/snack-bar/snack-bar-ref';
import {TextOnlySnackBar} from '@angular/material/snack-bar/simple-snack-bar';

export interface DialogData {
  bookingId: number;
  roomId: string;
  userId: String;
  cancelableSlots: MeetingRoomUnitSlot[];
}

@Component({
  selector: 'cancel-booking-dialog',
  templateUrl: 'cancel.booking.dialog.component.html',
  styleUrls: ['cancel.booking.dialog.component.sass']
})
export class CancelBookingDialogComponent implements BookingDialog {

  static WIDTH: string = '470px'
  static HEIGHT: string = '430px'

  dialogFormGroup: FormGroup
  snackRef: MatSnackBarRef<TextOnlySnackBar>

  constructor(
    private utils: UtilsService,
    private bookingService: BookingService,
    public dialogRef: MatDialogRef<CancelBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogParameters: DialogData,
    public _snackBar: MatSnackBar) {

    this.dialogFormGroup = new FormGroup({})
  }

  onCancelBooking(event: any) {

    (async () => {
      try {

        const cancelBookingResult = await this.bookingService.cancelBooking(this.dialogParameters.bookingId)
        console.info('@@ cancelBookingResult', cancelBookingResult)

        this.snackRef = this._snackBar.open(`Your booking was canceled`, 'Dismiss')
        this.snackRef.afterDismissed().subscribe(_ => this.dialogRef.close())

      } catch (error) {
        this.snackRef = this._snackBar.open(`There was an error processing your cancellation.\n 
        Your booking was not cancelled. \n
        The server replied with ${error.toString()}`, 'Dismiss')
      }
    })();
  }

  onAbandon(): void {
    this.dialogRef.close();
  }

}
