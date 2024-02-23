import { Routes } from '@angular/router';
import { TrainViewComponent } from './components/views/train-view/train-view.component';
import { StationViewComponent } from './components/views/station-view/station-view.component';

export const routes: Routes = [
  { path: 'station', component: StationViewComponent },
  { path: 'train', component: TrainViewComponent }
];
