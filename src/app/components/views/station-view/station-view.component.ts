import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { CdnService } from '../../../services/cdn.service';
import { CommonFunctionsService } from '../../../services/common-functions.service';
import { StationTrainInfoComponent } from '../../station/station-train-info/station-train-info.component';
import { CommonFormWrapper, StationForm } from '../../../models/form-models';
import { CommonEventsService } from '../../../services/common-events.service';
import { LoadingComponent } from '../../common/loading/loading.component';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { InfoComponent } from '../../common/info/info.component';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'hbb-station-view',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    InfoComponent,
    LoadingComponent,
    StationTrainInfoComponent,
    TranslateModule
  ],
  templateUrl: './station-view.component.html',
  styleUrl: './station-view.component.scss',
})
export class StationViewComponent {

  private reloadListener = this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event as NavigationEnd) // appease typescript
    )
    .subscribe((event) => {
      if (this.forceReload) {
        this.loading = true;
        this.getStationListing(
          this.id,
          this.date,
          this.start,
          this.end,
          this.types
        );
      }
    });
  protected compact = false;
  protected path = '/station';

  private id!: number;
  private date!: string;
  protected start!: string;
  protected end!: string;
  protected types!: number;
  private forceReload = false;

  protected dateDisplay!: string;

  protected error = false;
  protected errorMessage!: string;
  protected loading = false;
  protected station!: any;

  protected passedTrains = 0;
  protected showPassed = false;

  protected refreshIcon = faRefresh;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdnService: CdnService,
    private commonEventService: CommonEventsService,
    private commonFunctionsService: CommonFunctionsService,
    private router: Router,
    private scroller: ViewportScroller
  ) {}

  ngOnInit(): void {

    if(this.activatedRoute.snapshot.data['compact']){
      this.compact = true;
      this.path = '/compact';
    }

    let id;
    let date;
    let start;
    let end;
    let types;

    this.activatedRoute.queryParamMap.subscribe((data) => {
      id = data.get('id');
      date = data.get('date');
      start = data.get('start');
      end = data.get('end');
      types = data.get('types');

      let idOk = false;
      let dateOk = false;
      let startOk = false;
      let endOk = false;

      this.error = false;
      this.showPassed = false;

      // We'll need and id at least!

      // Check for valid id (just if it's number check):
      if (id && this.commonFunctionsService.REGEXP_NUMBER.test(id)) {
        idOk = true;
      }

      // Check for valid date:
      if (
        date &&
        (this.commonFunctionsService.REGEXP_DMY.test(date) ||
          this.commonFunctionsService.REGEXP_YMD.test(date))
      ) {
        dateOk = true;
      }

      // Let's set hours:
      const hours = this.commonFunctionsService.getHourSet(start,end);
      this.start = hours[0];
      this.end = hours[1];
      startOk = !start || this.start == start;
      endOk = !end || this.end == end;

      // Check for valid types. If valid, convert to int. If not, get default / user saved
      if (types && this.commonFunctionsService.REGEXP_TRAIN_TYPES.test(types)) {
        types = parseInt(types);
      } else if(!this.compact){
        types = this.commonFunctionsService.getDefaultOrUserTypes();
      } else {
        types = StationForm.DEFAULT_TYPES;
      }

      // We'll need an id at least!
      if (id && idOk) {
        this.error = false;
        this.loading = true;

        // Valid date? Good. No? Date is today
        if (date && dateOk) {
          date = this.commonFunctionsService.convertDateYMD(date);
        } else {
          date = moment().format(
            this.commonFunctionsService.MOMENT_DATE_YMD_FORMAT
          );
          this.router.navigate([this.path], {
            queryParams: { id: id, types: types },
          });
        }
        this.dateDisplay = this.commonFunctionsService.convertDateDMY(date);

        // Remove Hours if invalid!
        if(!startOk || !endOk){
          this.router.navigate([this.path], {
            queryParams: { id: id, date: date, start: null, end: null, types: types },
          });
        }

        this.id = parseInt(id);
        this.date = date;
        this.types = types;

        this.commonEventService.emitStationLoadedEvent(
          new CommonFormWrapper(false)
        );

        this.getStationListing(
          this.id,
          this.date,
          this.start,
          this.end,
          this.types
        );

      } else {
        this.error = false;
        this.loading = false;
        this.station = null;
        this.commonEventService.emitStationLoadedEvent(
          new CommonFormWrapper(true)
        );
        this.router.navigate([this.path]);
      }
    });
  }

  ngOnDestroy(): void {
    this.reloadListener.unsubscribe();
  }

  goToNextDay(){
    const nextDay = moment(this.date, this.commonFunctionsService.MOMENT_DATE_YMD_FORMAT).add(1, 'day').format(this.commonFunctionsService.MOMENT_DATE_DMY_FORMAT);
    this.refresh(nextDay);
  }

  refreshData(){
    this.refresh(this.date);
  }

  private refresh(day:string){
    this.router.navigate([this.path], {
      queryParams: { id: this.id, date: day, start: null, end: null, types: this.types },
    });
  }

  private getStationListing(
    id: number,
    date: string,
    start: string,
    end: string,
    types: number
  ) {
    this.passedTrains = 0;
    this.error = false;
    this.errorMessage = '';
    this.cdnService
      .getStationListing(id, date + ' ' + start, date + ' ' + end, types)
      .subscribe({
        next: (station) => {
          this.passedTrains = station.trainList.reduce((i: number, val: any) => {
            return (val.passedIP || val.passedHour) ? i + 1 : i;
          }, 0);
          this.finishDataProcessing(station);
          setTimeout(() => this.scroller.scrollToAnchor('header'));
        },
        error: (error: HttpErrorResponse) => {
          this.finishDataProcessing(null, true, (error.error && error.error.message) ? error.error.message : 'error');
        },
      });
  }

  private finishDataProcessing(stationData: any, error: boolean = false, message: string = ''): void {
    this.error = error;
    this.errorMessage = message;
    this.forceReload = true;
    this.loading = false;
    let station;
    if (stationData && stationData.stationIP) {
      station = {
        id: stationData.stationIP,
        name: stationData.stationName,
      };
    }
    this.commonEventService.emitStationLoadedEvent(
      new CommonFormWrapper(true, station)
    );
    this.station = stationData;
  }

}
