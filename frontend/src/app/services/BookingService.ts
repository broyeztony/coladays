import {Injectable, Output} from '@angular/core';
import * as sc from 'socketcluster-client';
import {AGClientSocket} from 'socketcluster-client';
import {EventEmitter} from 'selenium-webdriver';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {BookingDetail, BookingTransaction, IAuthorizableBookingMessage} from '../shared/domain';
import {Procedure, Transmit} from '../shared/protocol';
import {AuthService} from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  authToken: string
  socket: AGClientSocket;

  private _loadedExistingBookingSource = new Subject<BookingDetail[]>();
  _loadedExistingBooking$:Observable<BookingDetail[]> = this._loadedExistingBookingSource.asObservable();

  private _newBookingSource = new Subject<BookingTransaction>();
  _newBooking$: Observable<BookingTransaction> = this._newBookingSource.asObservable();

  private _canceledBookingSource = new Subject<number>();
  _canceledBooking$: Observable<number> = this._canceledBookingSource.asObservable();

  constructor(public auth: AuthService) {

    this.auth.idTokenClaims$.subscribe(tokenClaim => {

      if(tokenClaim) {
        this.authToken = tokenClaim.__raw
        console.log('@@ authToken', this.authToken)
        this.socket = sc.create({ hostname: 'localhost', port: 8000 });

        this.loadExistingBooking()
        this.bookingConfirmedChannelListener()
        this.bookingCanceledChannelListener()
      }
    })
  }

  loadExistingBooking() {

    (async () => {
      try {

        const existingBookingsResult =
          await this.socket.invoke(Procedure.GET_ALL_BOOKING_DETAILS, { authToken: this.authToken });
        const existingBookings = existingBookingsResult?.[0] || []
        this._loadedExistingBookingSource.next(existingBookings)

      } catch (error) {
        console.error('@@ error at invoke `GET_ALL_BOOKING_DETAILS`', error)
      }
    })();
  }

  // listen to BOOKING_CONFIRMED_CHANNEL server message
  bookingConfirmedChannelListener() {

    (async () => {

      let bookingConfirmedChannel = this.socket.subscribe(Transmit.BOOKING_CONFIRMED_CHANNEL, {
        data: { authToken: this.authToken }
      })
      await bookingConfirmedChannel.listener('subscribe').once()

      for await (let data of bookingConfirmedChannel) {
        console.log('@@ bookingConfirmedChannelListener received new Booking', data)
        this._newBookingSource.next(data)
      }

    })();
  }

  bookingCanceledChannelListener() {

    (async () => {

      let bookingCanceledChannel = this.socket.subscribe(Transmit.BOOKING_CANCELED_CHANNEL, {
        data: { authToken: this.authToken }
      })
      await bookingCanceledChannel.listener('subscribe').once()

      for await (let data of bookingCanceledChannel) {
        console.log('@@ bookingCanceledChannelListener received canceled Booking', data)
        this._canceledBookingSource.next(data)
      }

    })();
  }

  async createBooking(booking: BookingTransaction) {

    const message: IAuthorizableBookingMessage = {
      authToken: this.authToken,
      payload: booking
    }

    return await this.socket.invoke(Procedure.CREATE_BOOKING, message);
  }

  async cancelBooking(bookingId: number) {

    const message: IAuthorizableBookingMessage = {
      authToken: this.authToken,
      payload: bookingId
    }

    return await this.socket.invoke(Procedure.CANCEL_BOOKING, message);
  }
}
