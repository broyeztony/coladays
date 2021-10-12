import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {


  constructor (){

  }

  asMilitaryTime (time: number): string {
    return (time < 10) ? `0${time}:00` : `${time}:00`
  }

}
