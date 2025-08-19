import { TestBed } from '@angular/core/testing';

import { SharedMessage } from './shared-message';

describe('SharedMessage', () => {
  let service: SharedMessage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedMessage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
