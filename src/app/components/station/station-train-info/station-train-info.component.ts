import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faChevronUp,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TrainStatus } from '../../../models/train-status';
import moment from 'moment';
import { TrainStatusInfoComponent } from '../../train/train-status-info/train-status-info.component';
import { CommonFunctionsService } from '../../../services/common-functions.service';
import { CdnService } from '../../../services/cdn.service';
import { TrainStopListComponent } from '../../train/train-stop-list/train-stop-list.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'hbb-station-train-info',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    TranslateModule,
    TrainStatusInfoComponent,
    TrainStopListComponent,
  ],
  templateUrl: './station-train-info.component.html',
  styleUrl: './station-train-info.component.scss',
})
export class StationTrainInfoComponent implements OnInit {
  private MOMENT_HOURS_FORMAT = this.commonFunctionsService.MOMENT_HOURS_FORMAT;
  private MOMENT_MINUTES = this.commonFunctionsService.MOMENT_MINUTES;

  @Input() currentStationId! :string;
  @Input() showPassed = false;
  @Input() train!: any;
  @Input() types!: number;

  protected trainDetail!: any;

  protected downArrowIcon = faChevronDown;
  protected refreshIcon = faRefresh;
  protected upArrowIcon = faChevronUp;

  protected TrainStatus = TrainStatus;

  protected nextDate!: string;
  protected newHour: string | undefined;
  protected listStatusClass: string = '';

  protected loading = false;
  protected loadingRefresh = false;
  protected showTrainDetail = false;

  constructor(
    private cdnService: CdnService,
    private commonFunctionsService: CommonFunctionsService
  ) {}

  ngOnInit(): void {
      this.setupDetails();
  }

  getTrainDetail() {
    if (!this.loading && !this.loadingRefresh) {
      this.showTrainDetail = !this.showTrainDetail;
      if (this.showTrainDetail) {
        this.loading = true;
        this.fetchTrainDetail();
      }
    }
  }

  refreshTrainStatus() {
    // Tricky - if detail is closed, we'll need just
    // the status. If not, we'll need EVERYTHING
    if (!this.loading && !this.loadingRefresh) {
      this.loadingRefresh = true;
      if (this.showTrainDetail) {
        this.fetchTrainDetail();
      } else {
        this.cdnService
          .getTrainsStatus([
            { number: this.train.number1, date: this.train.dateStart },
          ])
          .subscribe({
            next: (response) => {
              if (response.length > 0) {
                this.train.status = response[0].status;
                this.train.updatedDateTime = response[0].updatedDateTime;
                this.setupDetails();
                this.loadingRefresh = false;
              }
            },
            error: (error) => {
              this.loadingRefresh = false;
            },
          });
      }
    }
  }

  private fetchTrainDetail() {
    this.cdnService
      .getTrainFullListing(this.train.number1, this.train.dateStart)
      .subscribe({
        next: (details) => {
          this.trainDetail = details.timetable;
          this.train.status = details.status;
          this.train.updatedDateTime = details.updatedDateTime;
          //this.train = this.train;
          this.nextDate = moment(this.train.dateStart, this.commonFunctionsService.MOMENT_DATE_YMD_FORMAT).add(1, 'day').format( this.commonFunctionsService.MOMENT_DATE_YMD_FORMAT);
          this.setupDetails();
          this.loading = false;
          this.loadingRefresh = false;
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
          this.loadingRefresh = false;
          this.showTrainDetail = false;
        },
      });
  }

  private setupDetails() {
    this.newHour = undefined;
     // Status fixes
      if (this.train.status) {
        if (this.train.status.type === TrainStatus.Delayed) {
          // Add delay if exists!
          const hourPlusDelay = moment(
            this.train.hour,
            this.MOMENT_HOURS_FORMAT
          ).add(this.train.status.delay, this.MOMENT_MINUTES);
          this.newHour = hourPlusDelay.format(this.MOMENT_HOURS_FORMAT);
        }

      this.listStatusClass = this.commonFunctionsService.setListStatusClass(
        this.train.status ? this.train.status.type : -1
      );
    }
  }
}
