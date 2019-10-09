import { TestBed, inject } from '@angular/core/testing';

import { SendServiceService } from './send-service.service';

describe('SendServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SendServiceService]
    });
  });

  it('should be created', inject([SendServiceService], (service: SendServiceService) => {
    expect(service).toBeTruthy();
  }));
});
