import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { onBoardingResolver } from './on-boarding.resolver';

describe('onBoardingResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => onBoardingResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
