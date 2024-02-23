import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainStatusInfoComponent } from './train-status-info.component';

describe('TrainStatusInfoComponent', () => {
  let component: TrainStatusInfoComponent;
  let fixture: ComponentFixture<TrainStatusInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainStatusInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainStatusInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
