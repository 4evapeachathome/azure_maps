import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FederallawPage } from './federallaw.page';

describe('FederallawPage', () => {
  let component: FederallawPage;
  let fixture: ComponentFixture<FederallawPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FederallawPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
