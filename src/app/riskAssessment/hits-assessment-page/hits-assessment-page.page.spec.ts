import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HitsAssessmentPagePage } from './hits-assessment-page.page';

describe('HitsAssessmentPagePage', () => {
  let component: HitsAssessmentPagePage;
  let fixture: ComponentFixture<HitsAssessmentPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HitsAssessmentPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
