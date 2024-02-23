import { EventEmitter, Injectable } from '@angular/core';
import { CommonFormWrapper } from '../models/form-models';

@Injectable({
  providedIn: 'root'
})
export class CommonEventsService {

  public stationLoaded: EventEmitter<CommonFormWrapper>;
  public trainLoaded: EventEmitter<CommonFormWrapper>;

  constructor() {
    this.stationLoaded = new EventEmitter();
    this.trainLoaded = new EventEmitter();
  }

  public emitStationLoadedEvent(evt :CommonFormWrapper): void {
    this.stationLoaded.emit(evt);
  }

  public emitTrainLoadedEvent(evt :CommonFormWrapper): void {
    this.trainLoaded.emit(evt);
  }
}
