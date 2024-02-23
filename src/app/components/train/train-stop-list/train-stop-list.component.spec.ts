import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainStopListComponent } from './train-stop-list.component';

describe('TrainStopListComponent', () => {
  let component: TrainStopListComponent;
  let fixture: ComponentFixture<TrainStopListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainStopListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainStopListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
