import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { viewResultGuard } from './view-result.guard';

describe('viewResultGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => viewResultGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
