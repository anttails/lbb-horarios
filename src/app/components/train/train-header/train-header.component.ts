import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { TrainStatus } from '../../../models/train-status';
import { CdnService } from '../../../services/cdn.service';
import { CommonFunctionsService } from '../../../services/common-functions.service';
import { TrainStatusInfoComponent } from '../train-status-info/train-status-info.component';

@Component({
  selector: 'hbb-train-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule, TranslateModule, TrainStatusInfoComponent],
  templateUrl: './train-header.component.html',
  styleUrl: './train-header.component.scss'
})
export class TrainHeaderComponent implements OnChanges{

  private MOMENT_DURATION_FORMAT = this.commonFunctionsService.MOMENT_DURATION_FORMAT;
  private MOMENT_HOURS_FORMAT = this.commonFunctionsService.MOMENT_HOURS_FORMAT;
  private MOMENT_MINUTES = this.commonFunctionsService.MOMENT_MINUTES;

  @Input() end :string[] = ['',''];
  @Input() types!: number;
  @Input() loadingRefresh = false;
  @Input() start :string[] = ['',''];
  @Input() train! :any;

  @Output() callRefresh = new EventEmitter<any>();

  protected endDate! :string;
  protected endHour :string | undefined;
  protected endHourPlusDelay! :string;
  protected startDate! :string;
  protected startHour! :string;
  protected tripDuration :string | undefined;
  protected tripDurationPlusDelay! :string;

  protected listStatusClass :string = '';

  protected refreshIcon = faRefresh;
  protected trainStatusEnum = TrainStatus;

  constructor(private commonFunctionsService :CommonFunctionsService, private cdnService :CdnService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(this.train){
      this.startHour = this.start[1];
      this.endHourPlusDelay = this.end[1];
      this.startDate = this.start[0];
      this.endDate = this.end[0];

      let localTripDuration = this.train.tripDuration;
      // Inconsistency trip duration fix if needed
      if(this.train.inconsistency > 0 && this.train.tripDurationFix){
        localTripDuration = this.train.tripDurationFix;
      }
      let tripDurationMoment = moment(localTripDuration, this.MOMENT_HOURS_FORMAT);

      // Add delay if exists!
      if(this.train.status && this.train.status.type === TrainStatus.Delayed){
        this.endHour = this.end[1];
        const hourPlusDelay =  moment(this.end[1], this.MOMENT_HOURS_FORMAT).add(this.train.status.delay, this.MOMENT_MINUTES);
        this.endHourPlusDelay = hourPlusDelay.format(this.MOMENT_HOURS_FORMAT);

        this.tripDuration = tripDurationMoment.format(this.MOMENT_DURATION_FORMAT);
        this.tripDurationPlusDelay = tripDurationMoment.add(this.train.status.delay, this.MOMENT_MINUTES).format(this.MOMENT_DURATION_FORMAT);

      } else{
        this.endHour = undefined;
        this.tripDuration = undefined;
        this.tripDurationPlusDelay = tripDurationMoment.format(this.MOMENT_DURATION_FORMAT);
      }

      this.listStatusClass = this.commonFunctionsService.setListStatusClass(this.train.status.type);
    }
  }

  refreshTrainStatus() {
    this.callRefresh.emit({number: this.train.number, date: this.startDate});
  }
}
