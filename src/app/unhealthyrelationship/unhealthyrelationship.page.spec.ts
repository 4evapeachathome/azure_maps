import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnhealthyrelationshipPage } from './unhealthyrelationship.page';

describe('UnhealthyrelationshipPage', () => {
  let component: UnhealthyrelationshipPage;
  let fixture: ComponentFixture<UnhealthyrelationshipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UnhealthyrelationshipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
