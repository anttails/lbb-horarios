import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CdnService {

private CDN_URL = environment.cdnURL;

private CDN_TIMETABLE_ENDPOINT = this.CDN_URL + '/timetable';
private CDN_STATION_ENDPOINT = this.CDN_TIMETABLE_ENDPOINT + '/station';
private CDN_TRAIN_ENDPOINT = this.CDN_TIMETABLE_ENDPOINT + '/train';

  constructor(private http: HttpClient) { }

  // * STATIONS API
  getNearestStations(lat :number, lng :number) {
    return this.http.post<any[]>(
      `${this.CDN_STATION_ENDPOINT}/geolocation/`,
      ({lat: lat, lng: lng})
    );
  }

  getStationListing(id :number, start? :string, end? :string, types? :number) {
    return this.http.post<any>(
      `${this.CDN_STATION_ENDPOINT}/listing/`,
      ({id: id, start: start, end: end, types: types})
    );
  }

  searchStations(term: string) {
    return this.http.post<any[]>(
      `${this.CDN_STATION_ENDPOINT}/search/`,
      ({term: term})
    );
  }

  // * TRAINS API
  getTrainFullListing(number: number, date? :string){
    return this.http.get<any>(
      `${this.CDN_TRAIN_ENDPOINT}/fullListing/${number}/${date ? date : ''}`);
  }

  getPlatformsByTrain(number: number){
    return this.http.get<any>(
      `${this.CDN_TRAIN_ENDPOINT}/platforms/${number}`);
  }

  getTrainsStatus(numbers: object[]){
    return this.http.post<any[]>(
      `${this.CDN_TRAIN_ENDPOINT}/statuses` ,{trains: numbers});
  }

}
