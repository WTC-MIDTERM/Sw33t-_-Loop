import { TestBed } from '@angular/core/testing';

import { Strapi } from './strapi';

describe('Strapi', () => {
  let service: Strapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Strapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
