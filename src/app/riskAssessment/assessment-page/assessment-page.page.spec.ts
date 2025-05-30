import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssessmentPagePage } from './assessment-page.page';

describe('AssessmentPagePage', () => {
  let component: AssessmentPagePage;
  let fixture: ComponentFixture<AssessmentPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
