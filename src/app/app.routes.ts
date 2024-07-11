import { Routes } from '@angular/router';
import { TrainViewComponent } from './components/views/train-view/train-view.component';
import { StationViewComponent } from './components/views/station-view/station-view.component';
import { AppComponent } from './app.component';
import { MainViewComponent } from './components/views/main-view/main-view.component';
import { IframeViewComponent } from './components/views/iframe-view/iframe-view.component';

export const routes: Routes = [
  { path: '', component:AppComponent,
    children: [
      {
        path: '', component: MainViewComponent,
        children: [
          { path: 'station', component: StationViewComponent },
          { path: 'train', component: TrainViewComponent },
        ]
      },
      {
        path: '', component: IframeViewComponent,
        children: [
          { path: 'compact', component: StationViewComponent }
        ]
      }
    ]
  }

];
