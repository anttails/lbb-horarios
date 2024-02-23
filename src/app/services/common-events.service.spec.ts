import { TestBed } from '@angular/core/testing';

import { CommonEventsService } from './common-events.service';

describe('CommonEventsService', () => {
  let service: CommonEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
