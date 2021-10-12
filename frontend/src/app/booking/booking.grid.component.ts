import {Component, Inject, OnInit} from '@angular/core';
import {CartesianProduct} from 'js-combinatorics';
import {DOCUMENT} from '@angular/common';
import {AuthService} from '@auth0/auth0-angular';
import {MatDialog} from '@angular/material/dialog';
import {CreateBookingDialogComponent} from './dialog/create.booking/create.booking.dialog.component';
import {AGClientSocket} from 'socketcluster-client';
import {BookingService} from '../services/BookingService';
import {MeetingRoomUnitSlot, BookingStatus, BookingDetail, SlotColor, SlotBorder, BookingTransaction} from '../shared/domain'
import {UtilsService} from '../services/UtilsService';
import {CancelBookingDialogComponent} from './dialog/cancel.booking/cancel.booking.dialog.component';
import {MatDialogConfig} from '@angular/material/dialog/dialog-config';

@Component({
  selector: 'booking-grid',
  templateUrl: './booking.grid.component.html',
  styleUrls: ['./booking.grid.component.sass']
})
export class BookingGridComponent implements OnInit {

  meetingRooms: Set<string> = new Set([
    'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10',
    'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10',
  ])

  // we keep hoursOfTheDay as a Set<string> because it must be the same type as meetingRooms to be passed as arg of CartesianProduct
  hoursOfTheDay: Set<string> = new Set(((start: number, end: number) => Array.from({length: (end - start)}, (v, k) => k + start))(0, 24).map(_ => _.toString()))
  slots: MeetingRoomUnitSlot[]
  userProfile: any
  socket: AGClientSocket;

  constructor(@Inject(DOCUMENT) public document: Document,
              public dialog: MatDialog,
              public auth: AuthService,
              private bookingService: BookingService,
              private utils: UtilsService){}

  ngOnInit(): void {

    this.slots =
      [...new CartesianProduct(this.meetingRooms, this.hoursOfTheDay)]
        .map(slot => {
          const roomId = slot[0]
          const hour = Number(slot[1])
          const militaryTime = this.utils.asMilitaryTime(hour)
          const bookingStatus = BookingStatus.BOOKABLE
          const userId = null;
          const slotColor = SlotColor.BOOKABLE;
          const slotBorder = SlotBorder.BOOKABLE;

          return {
            roomId,
            hour,
            militaryTime,
            bookingStatus,
            userId,
            slotColor,
            slotBorder
          }
        })

    this.auth.user$.subscribe(profile => this.userProfile = profile)
    this.bookingService._loadedExistingBooking$.subscribe(bookings => this.resetWithExistingBookings(bookings))
    this.bookingService._newBooking$.subscribe(booking => this.updateGridWithNewBooking(booking))
    this.bookingService._canceledBooking$.subscribe(bookingId => this.updateGridWithCancellation(bookingId))
  }

  updateGridWithNewBooking(newBooking: BookingTransaction){

    this.slots =
      this.slots.map(slot => {
        if(
          slot.roomId === newBooking.roomId &&
          (slot.hour >= newBooking.fromTime && slot.hour < newBooking.toTime)
        ) {

          slot.bookingId = newBooking.bookingId
          slot.userId = newBooking.userId
          slot.bookingStatus = (newBooking.userId === this.userProfile.sub) ? BookingStatus.BOOKED_BY_ME : BookingStatus.BOOKED_BY_OTHERS
          slot.slotColor = (newBooking.userId === this.userProfile.sub) ? SlotColor.BOOKED_BY_ME : SlotColor.BOOKED_BY_OTHERS
          slot.slotBorder = SlotBorder.BOOKED
        }
        return slot;
    })
  }

  updateGridWithCancellation(bookingId: number){

    this.slots =
      this.slots.map(slot => {
        if(slot.bookingId === bookingId) {
          slot.bookingStatus = BookingStatus.BOOKABLE
          slot.slotColor = SlotColor.BOOKABLE
          slot.slotBorder = SlotBorder.BOOKABLE
          slot.userId = null
          slot.bookingId = undefined
        }
        return slot;
    })
  }

  resetWithExistingBookings(existingBookings: BookingDetail[]){

    this.slots =
      this.slots
        .map(slot => {
          const roomId = slot.roomId
          const hour = slot.hour

          const L = existingBookings.filter(_ => _.hour === hour && _.room === roomId)
          const slotIsBooked = L.length === 1

          const userId = (slotIsBooked && L?.[0].userId) || null
          const bookingId = (slotIsBooked && L?.[0].id) || undefined
          let slotColor = SlotColor.BOOKABLE
          let slotBorder = SlotBorder.BOOKABLE
          let bookingStatus: BookingStatus = BookingStatus.BOOKABLE
          if (userId) {
            slotColor = (userId === this.userProfile?.sub) ? SlotColor.BOOKED_BY_ME : SlotColor.BOOKED_BY_OTHERS
            bookingStatus = (userId === this.userProfile?.sub) ? BookingStatus.BOOKED_BY_ME : BookingStatus.BOOKED_BY_OTHERS
            slotBorder = SlotBorder.BOOKED
          }

          slot.userId = userId
          slot.bookingId = bookingId
          slot.slotBorder = slotBorder
          slot.slotColor = slotColor
          slot.bookingStatus = bookingStatus

          return slot
        })
  }

  onSlotClick(event: MeetingRoomUnitSlot) {

    switch(event.bookingStatus) {

      case BookingStatus.BOOKABLE: // => we'll take this path to create a new booking
        const selectedRoomSlots = this.slots.filter(slot => slot.roomId === event.roomId)
        const createDialogData = {
          roomId: event.roomId,
          startTime: event.hour,
          militaryTimeStart: event.militaryTime,
          userId: this.userProfile?.sub,
          roomSlots: selectedRoomSlots
        }

        this.openDialog(CreateBookingDialogComponent, {
          width: CreateBookingDialogComponent.WIDTH,
          height: CreateBookingDialogComponent.HEIGHT,
          data: createDialogData
        })
        break;
      case BookingStatus.BOOKED_BY_ME: // => we'll take this path to cancel an existing booking done by ourselves

        const cancelableSlots = this.slots.filter(slot => slot.bookingId === event.bookingId)
        const cancelDialogData = {
          bookingId: event.bookingId,
          roomId: event.roomId,
          userId: event.userId,
          cancelableSlots
        }

        this.openDialog(CancelBookingDialogComponent, {
          width: CancelBookingDialogComponent.WIDTH,
          height: CancelBookingDialogComponent.HEIGHT,
          data: cancelDialogData
        })
        break;
    }
  }

  openDialog(concreteClass: any, config: MatDialogConfig<any>) {
    return this.dialog.open(concreteClass, config)
  }


}

