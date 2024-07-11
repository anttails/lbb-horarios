import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'hbb-train-stop-list',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule, TranslateModule],
  templateUrl: './train-stop-list.component.html',
  styleUrl: './train-stop-list.component.scss'
})
export class TrainStopListComponent implements OnInit{

  protected faInfoCircle = faInfoCircle;
  protected target = '_self';

  @Input() compact: boolean = false;
  @Input() small: boolean = false;

  @Input() currentStationId! :string;
  @Input() nextDate!: string;
  @Input() startDate!: string;
  @Input() trainClass :string = 'o';

  @Input() stopList :any = [];

  @Input() types!: number;

  ngOnInit(): void {
    if(this.compact){
      this.target = '_blank';
    }
  }

}
