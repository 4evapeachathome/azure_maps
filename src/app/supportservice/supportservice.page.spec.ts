import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportservicePage } from './supportservice.page';

describe('SupportservicePage', () => {
  let component: SupportservicePage;
  let fixture: ComponentFixture<SupportservicePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportservicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
