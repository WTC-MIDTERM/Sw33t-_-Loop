import { TestBed } from '@angular/core/testing';

import { PendingOrder } from './pending-order';

describe('PendingOrder', () => {
  let service: PendingOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
