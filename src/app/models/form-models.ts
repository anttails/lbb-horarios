export class CommonFormWrapper {
  loaded: boolean = false;
  stationData?: any;

  constructor(loaded: boolean, stationData?: any){
    this.loaded = loaded;
    this.stationData = stationData;
  }
}


export class StationForm {

  public static DEFAULT_TYPES = 255;
  public static MAX_TYPES = 511;
  public static MIN_TYPES = 1;

  id?: any;
  date?: string;
  start: string = '';
  end: string = '';
  types: number = StationForm.MAX_TYPES;
}


export class TrainForm {
  number?: number;
  date?: string;
}


