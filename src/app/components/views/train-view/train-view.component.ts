import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import moment from 'moment';
import { filter, map } from 'rxjs';
import { CommonFormWrapper } from '../../../models/form-models';
import { CdnService } from '../../../services/cdn.service';
import { CommonEventsService } from '../../../services/common-events.service';
import { CommonFunctionsService } from '../../../services/common-functions.service';
import { LoadingComponent } from '../../common/loading/loading.component';
import { TrainHeaderComponent } from '../../train/train-header/train-header.component';
import { TrainStopListComponent } from '../../train/train-stop-list/train-stop-list.component';
import { InfoComponent } from '../../common/info/info.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'hbb-train-view',
  standalone: true,
  imports: [InfoComponent, LoadingComponent, TrainHeaderComponent, TrainStopListComponent],
  templateUrl: './train-view.component.html',
  styleUrl: './train-view.component.scss',
})
export class TrainViewComponent implements OnInit, OnDestroy {
  private MOMENT_DATE_DMY_FORMAT =
    this.commonFunctionsService.MOMENT_DATE_DMY_FORMAT;
  private MOMENT_DATE_DMY_TIME_FORMAT =
    this.commonFunctionsService.MOMENT_DATE_DMY_TIME_FORMAT;
  private MOMENT_HOURS_FORMAT = this.commonFunctionsService.MOMENT_HOURS_FORMAT;

  private reloadListener = this.router.events
    .pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event as NavigationEnd) // appease typescript
    )
    .subscribe((event) => {
      if (this.forceReload) {
        this.loading = true;
        this.getTrainListing(this.number, this.date);
      }
    });

  private number!: number;
  private date!: string;
  private forceReload = false;

  protected end: string[] = ['', ''];
  protected error = false;
  protected errorMessage!: string;
  protected loading = false;
  protected loadingRefresh = false;
  protected start: string[] = ['', ''];
  protected train!: any;
  protected types!: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdnService: CdnService,
    private commonEventService: CommonEventsService,
    private commonFunctionsService: CommonFunctionsService,
    private router: Router,
    private scroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    let number;
    let date;

    this.activatedRoute.queryParamMap.subscribe((data) => {
      number = data.get('number');
      date = data.get('date');
      let numberOk = false;
      let dateOk = false;

      this.error = false;

      // Check for valid number:
      if (
        number &&
        this.commonFunctionsService.REGEXP_TRAIN_NUMBER.test(number)
      ) {
        numberOk = true;
      }

      // Check for valid date:
      if (
        date &&
        (this.commonFunctionsService.REGEXP_DMY.test(date) ||
          this.commonFunctionsService.REGEXP_YMD.test(date))
      ) {
        dateOk = true;
      }

      // We have number? Fetch data
      if (number && numberOk) {
        this.error = false;
        this.loading = true;

        // Valid date? Good. No? Date is today
        if (date && dateOk) {
          date = this.commonFunctionsService.convertDateYMD(date);
        } else {
          date = moment().format(
            this.commonFunctionsService.MOMENT_DATE_YMD_FORMAT
          );
          this.router.navigate(['/train'], {
            queryParams: { number: number, date: null },
          });
        }
        this.number = parseInt(number);
        this.date = date;
        this.commonEventService.emitTrainLoadedEvent(
          new CommonFormWrapper(false)
        );
        this.getTrainListing(this.number, this.date);
      } else {
        this.end = ['', ''];
        this.error = false;
        this.loading = false;
        this.start = ['', ''];
        this.train = null;
        this.commonEventService.emitTrainLoadedEvent(
          new CommonFormWrapper(true)
        );
        this.router.navigate(['/train'], {
          queryParams: { number: null, date: null },
        });
      }
    });
    this.types = this.commonFunctionsService.getDefaultOrUserTypes();
  }

  ngOnDestroy(): void {
    this.reloadListener.unsubscribe();
  }

  protected refreshTrain(info: any): void {
    this.forceReload = false;
    this.loadingRefresh = true;
    this.getTrainListing(
      info.number,
      this.commonFunctionsService.convertDateYMD(info.date)
    );
  }

  private getTrainListing(number: number, date: string) {
    this.error = false;
    this.errorMessage = '';
    this.cdnService.getTrainFullListing(number, date).subscribe({
      next: (train) => {
        this.finishDataProcessing(train);
        this.end = this.generateDateNHourWFix(
          this.train.endDateTime,
          this.train.endDateTimeFix
        );
        this.start = this.generateDateNHourWFix(
          this.train.startDateTime,
          this.train.startDateTimeFix
        );
        setTimeout(() => this.scroller.scrollToAnchor('header'));
      },
      error: (error: HttpErrorResponse) => {
        this.finishDataProcessing(null, true, (error.error && error.error.message) ? error.error.message : 'error');
      },
    });
  }

  private finishDataProcessing(trainData: any, error: boolean = false, message: string = ''): void {
    this.error = error;
    this.errorMessage = message;
    this.forceReload = true;
    this.loadingRefresh = false;
    this.loading = false;
    this.commonEventService.emitTrainLoadedEvent(new CommonFormWrapper(true));
    this.train = trainData;
  }

  private generateDateNHourWFix(
    dateTime: string,
    dateTimeFix: string
  ): string[] {
    return this.generateDateNHour(dateTimeFix ? dateTimeFix : dateTime);
  }

  private generateDateNHour(dateTime: string): string[] {
    const hour = moment(dateTime, this.MOMENT_DATE_DMY_TIME_FORMAT).format(
      this.MOMENT_HOURS_FORMAT
    );
    const date = moment(dateTime, this.MOMENT_DATE_DMY_TIME_FORMAT).format(
      this.MOMENT_DATE_DMY_FORMAT
    );
    return [date, hour];
  }
}
