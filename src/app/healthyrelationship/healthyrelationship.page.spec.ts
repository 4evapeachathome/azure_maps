import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthyrelationshipPage } from './healthyrelationship.page';

describe('HealthyrelationshipPage', () => {
  let component: HealthyrelationshipPage;
  let fixture: ComponentFixture<HealthyrelationshipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthyrelationshipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
