import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalrightsPage } from './legalrights.page';

describe('LegalrightsPage', () => {
  let component: LegalrightsPage;
  let fixture: ComponentFixture<LegalrightsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalrightsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
