import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'hbb-iframe-view',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './iframe-view.component.html',
  styleUrl: './iframe-view.component.scss'
})
export class IframeViewComponent {

}
