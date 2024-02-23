import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainHeaderComponent } from './train-header.component';

describe('TrainHeaderComponent', () => {
  let component: TrainHeaderComponent;
  let fixture: ComponentFixture<TrainHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
