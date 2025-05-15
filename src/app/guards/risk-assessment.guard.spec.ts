import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { riskAssessmentGuard } from './risk-assessment.guard';

describe('riskAssessmentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => riskAssessmentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
