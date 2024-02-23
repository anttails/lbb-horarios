import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCheckCircle, faCircleInfo, faCircleXmark, faClock, faFlagCheckered, faWarning } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TrainStatus } from '../../../models/train-status';

@Component({
  selector: 'hbb-train-status-info',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  templateUrl: './train-status-info.component.html',
  styleUrl: './train-status-info.component.scss'
})
export class TrainStatusInfoComponent implements OnChanges{


  @Input() status! :any;
  @Input() updatedDateTime! :string;
  message :string = 'noProblem';
  statusIcon! :IconProp;
  trainStatusEnum = TrainStatus;

  ngOnChanges(changes: SimpleChanges): void {
    if(this.status){
      this.statusIcon = this.setIcon();
      this.message = this.setMessage();
    }
  }

  private setMessage() :string {
    switch(this.status.type){
      case(TrainStatus.Ok): return 'noProblem';
      case(TrainStatus.Programmed): return 'programmed';
      case(TrainStatus.ToDepart): return 'toDepart';
      case(TrainStatus.Cancelled): return 'cancelled';
      case(TrainStatus.Done): return 'done';
    }
    return 'noProblem';
  }

  private setIcon() :IconProp {
    switch(this.status.type){
      case(TrainStatus.Ok): return faCheckCircle;
      case(TrainStatus.StationInfo):
      case(TrainStatus.Programmed): return faClock;
      case(TrainStatus.ToDepart):
      case(TrainStatus.Delayed): return faWarning;
      case(TrainStatus.Cancelled): return faCircleXmark;
      case(TrainStatus.Done): return faFlagCheckered;
    }
    return faCircleInfo;
  }

}
