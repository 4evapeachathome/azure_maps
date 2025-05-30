import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentSummaryPage } from './assessment-summary.page';

describe('AssessmentSummaryPage', () => {
  let component: AssessmentSummaryPage;
  let fixture: ComponentFixture<AssessmentSummaryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
