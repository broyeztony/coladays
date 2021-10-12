
export interface MeetingRoomUnitSlot {
  roomId: string;
  hour: number;
  militaryTime: string;
  bookingStatus: BookingStatus;
  userId: string | null;
  slotColor: SlotColor;
  slotBorder: SlotBorder;
  bookingId?: number;
}

export interface BookingDetail {
  id: number;
  userId: string;
  room: string;
  hour: number;
}

export interface BookingTransaction {
  userId: string;
  roomId: string;
  fromTime: number;
  toTime: number;
  bookingId?: number;
  status?: string; // TODO: link to BookingStatus
}

export interface IAuthorizableBookingMessage {
  authToken: string,
  payload: any
}

export enum BookingStatus {
  BOOKABLE = 2,
  BOOKED_BY_ME = 1,
  BOOKED_BY_OTHERS = 0,
}

export enum SlotColor {
  BOOKABLE = 'white',
  BOOKED_BY_ME = '#4192D9',
  BOOKED_BY_OTHERS = '#BF0413',
}

export enum SlotBorder {
  BOOKED = '1px dashed black',
  BOOKABLE = '1px dotted darkgrey'
}
