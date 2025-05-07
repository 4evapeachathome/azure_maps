import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalrightshomePage } from './legalrightshome.page';

describe('LegalrightshomePage', () => {
  let component: LegalrightshomePage;
  let fixture: ComponentFixture<LegalrightshomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalrightshomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
