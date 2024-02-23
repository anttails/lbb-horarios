import { Injectable } from '@angular/core';
import moment from 'moment';
import { TrainStatus } from '../models/train-status';
import { StationForm } from '../models/form-models';

@Injectable({
  providedIn: 'root'
})
export class CommonFunctionsService {

  public MOMENT_DATE_DMY_FORMAT = 'DD-MM-YYYY';
  public MOMENT_DATE_DMY_TIME_FORMAT = 'DD-MM-YYYY HH:mm';
  public MOMENT_DATE_YMD_FORMAT = 'YYYY-MM-DD';
  public MOMENT_DATE_YMD_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  public MOMENT_DURATION_FORMAT = 'H[h ]mm[m]';
  public MOMENT_HOURS_FORMAT = 'HH:mm';
  public MOMENT_MINUTES = 'minutes';

  public REGEXP_DMY: RegExp = /^\d{2}-\d{2}-\d{4}$/;
  public REGEXP_NUMBER: RegExp = /^[0-9]+$/;
  public REGEXP_HOURS: RegExp = /^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/;
  public REGEXP_TRAIN_NUMBER: RegExp = /^(?:[1-9]\d{0,4}|99999)$/;
  public REGEXP_TRAIN_TYPES: RegExp = /^(?:[1-9]|[1-9][0-9]|[1-4][0-9]{2}|5(?:[0-9]{2}|1[0-1]))$/;
  public REGEXP_YMD: RegExp = /^\d{4}-\d{2}-\d{2}$/;

  public HOURS_MAX = '23:59';
  public HOURS_MIN = '00:00';

  constructor() { }

  // TODO optimize this class..
  public convertDateDMY(date :string){

    // If it's already on DMY  format, no need to do anything;
    if(date && this.REGEXP_DMY.test(date)){
      return date;
    }

    return moment(date, this.MOMENT_DATE_YMD_FORMAT).format(this.MOMENT_DATE_DMY_FORMAT);
  }

  public convertDateYMD(date :string){

    // If it's already on YMD  format, no need to do anything;
    if(date && this.REGEXP_YMD.test(date)){
      return date;
    }

    return moment(date, this.MOMENT_DATE_DMY_FORMAT).format(this.MOMENT_DATE_YMD_FORMAT);
  }

  public getHourSet(start: string | null, end: string | null): string[]{
      start = (start && this.REGEXP_HOURS.test(start)) ? start : this.HOURS_MIN;
      end = (end && this.REGEXP_HOURS.test(end)) ? end : this.HOURS_MAX;

      // Last check. If start >= end, default
      if(start >= end){
        start = this.HOURS_MIN;
        end = this.HOURS_MAX;
      }

      return [start, end];

  }

  public getToday(): string{
    return moment().format(this.MOMENT_DATE_DMY_FORMAT);
  }

  public setValidDate(date?: string | null): string {
    if(date && (this.REGEXP_DMY.test(date) || this.REGEXP_YMD.test(date))){
      return this.convertDateDMY(date);
    } else {
      return this.getToday();
    }
  }

  public getDefaultOrUserTypes(): number{
    const userTypes = localStorage.getItem('types');
    if(userTypes && this.REGEXP_TRAIN_TYPES.test(userTypes)){
      return parseInt(userTypes);
    }
    return StationForm.DEFAULT_TYPES;
  }

  public setListStatusClass(status :number) :string{
    const eventClass = this.setStatusClass(status);
    return eventClass == '' ? eventClass : ('list-group-item-' + eventClass);
  }

  private setStatusClass(status:number) :string {
    switch(status){
      case(TrainStatus.StationInfo): return 'light';
      case(TrainStatus.Ok): return 'success';
      case(TrainStatus.Done): return 'primary';
      case(TrainStatus.Programmed): return 'info';
      case(TrainStatus.ToDepart): return 'secondary';
      case(TrainStatus.Delayed): return 'warning';
      case(TrainStatus.Cancelled): return 'danger';
    }
    return '';
  }

}
