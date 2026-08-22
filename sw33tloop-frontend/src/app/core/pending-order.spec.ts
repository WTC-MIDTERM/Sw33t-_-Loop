import { TestBed } from '@angular/core/testing';

import { PendingOrderService } from './pending-order';

describe('PendingOrderService', () => {
  let service: PendingOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});