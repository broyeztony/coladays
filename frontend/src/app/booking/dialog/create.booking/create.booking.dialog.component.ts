import {Component, Inject, OnDestroy, Optional} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AGClientSocket} from 'socketcluster-client';
import {BookingService} from '../../../services/BookingService';
import {BookingStatus, BookingTransaction, MeetingRoomUnitSlot} from '../../../shared/domain';
import {UtilsService} from '../../../services/UtilsService';
import {BookingDialog} from '../booking.dialog.interface';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TransactionStatus} from '../../../shared/protocol';
import {MatSnackBarRef} from '@angular/material/snack-bar/snack-bar-ref';
import {TextOnlySnackBar} from '@angular/material/snack-bar/simple-snack-bar';
import {Subscription} from 'rxjs/internal/Subscription';

export interface DialogData {
  roomId: string;
  userId: string;
  startTime: number;
  militaryTimeStart: string;
  roomSlots: MeetingRoomUnitSlot[];
}

export interface TimeData {
  time: number;
  militaryTime: string;
}

@Component({
  selector: 'create-booking-dialog',
  templateUrl: 'create.booking.dialog.component.html',
  styleUrls: ['create.booking.dialog.component.sass']
})
export class CreateBookingDialogComponent implements BookingDialog, OnDestroy {

  static WIDTH: string = '450px'
  static HEIGHT: string = '330px'

  dialogFormGroup: FormGroup
  timeData: TimeData[] = []
  selectedTime: TimeData
  invalidState: boolean = false
  newBookingObservableSubscription: Subscription

  constructor(
    private utils: UtilsService,
    private bookingService: BookingService,
    public dialogRef: MatDialogRef<CreateBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogParameters: DialogData,
    public _snackBar: MatSnackBar) {

    console.log('@@ CreateBookingDialogComponent', this.dialogParameters)

    this.dialogFormGroup = new FormGroup({})
    this.newBookingObservableSubscription = this.bookingService._newBooking$.subscribe(booking => this.checkBookingConflict(booking))

    const startTime: number = this.dialogParameters.startTime
    for (let i = startTime + 1 ; i <= 24 ; i++) {

      this.timeData.push({
        time: i,
        militaryTime: this.utils.asMilitaryTime(i)
      })

      if(this.dialogParameters.roomSlots[i]) { // we allow booking slots until there's no next bookable slots
        if (this.dialogParameters.roomSlots[i].bookingStatus !== BookingStatus.BOOKABLE) {
          break;
        }
      }
    }
  }

  ngOnDestroy(){
    this.newBookingObservableSubscription.unsubscribe()
  }

  onSelectionChange(event: any) {
    this.selectedTime = this.timeData.find(value => value.time === event) as TimeData
  }

  checkBookingConflict(existingBooking: BookingTransaction){

    console.log('@@ checkBookingConflict existingBooking', existingBooking)

    if(existingBooking.roomId === this.dialogParameters.roomId &&
      (existingBooking.fromTime <= this.dialogParameters.startTime && existingBooking.toTime > this.dialogParameters.startTime)) {

      if(existingBooking.userId !== this.dialogParameters.userId) {

        this.invalidState = true
        const bookingConflictMessage: string = `The current booking start time is in a conflict with an existing booking. \n
        You can not complete this booking. We invite you to booking another slot.`
        const snackRef = this._snackBar.open(bookingConflictMessage, 'Dismiss', {})
        snackRef.afterDismissed().subscribe(_ => this.dialogRef.close())
      }
    }
  }

  onCreateBooking(event: any) {

    if(!this.selectedTime || isNaN(this.selectedTime.time)) {
      return
    }

    (async () => { // send booking transaction

      let newBooking: BookingTransaction = {
        userId: this.dialogParameters.userId,
        fromTime: this.dialogParameters.startTime,
     	  toTime: this.selectedTime.time,
        roomId: this.dialogParameters.roomId
      }
      console.log('@@ onBooking transaction', newBooking)
      try {

        const createNewBookingResult = await this.bookingService.createBooking(newBooking)
        console.log('@@ createNewBookingResult', createNewBookingResult)
        if(createNewBookingResult.status === TransactionStatus.SUCCESS) {

          const snackRef = this._snackBar.open(`Your booking is confirmed. 
          Your booking reference is ${createNewBookingResult.bookingRef}. You will receive a confirmation by email in the next minutes.`,
            '', { duration: 5000})
          this.dialogRef.close(createNewBookingResult)
        }
        else {
          const snackRef = this._snackBar.open(`Your booking could not be completed.\nThe server replied with ${createNewBookingResult.error.message}`, 'Dismiss')
          snackRef.afterDismissed().subscribe(_ => this.dialogRef.close())
        }
      }
      catch (error) {
        const snackRef = this._snackBar.open(`Your booking could not be completed.\nThere was an error processing your request. ${error.toString()}`, 'Dismiss')
        snackRef.afterDismissed().subscribe(_ => this.dialogRef.close())
      }
    })();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
