import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationTrainInfoComponent } from './station-train-info.component';
import { RouterModule } from '@angular/router';

describe('StationTrainInfoComponent', () => {
  let component: StationTrainInfoComponent;
  let fixture: ComponentFixture<StationTrainInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule, StationTrainInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StationTrainInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
