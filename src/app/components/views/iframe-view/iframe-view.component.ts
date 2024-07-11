import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'hbb-iframe-view',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslateModule
  ],
  templateUrl: './iframe-view.component.html',
  styleUrl: './iframe-view.component.scss'
})
export class IframeViewComponent {

}
