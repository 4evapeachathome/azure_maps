import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RatAssessmentQuestionsComponent } from './rat-assessment-questions.component';

describe('RatAssessmentQuestionsComponent', () => {
  let component: RatAssessmentQuestionsComponent;
  let fixture: ComponentFixture<RatAssessmentQuestionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RatAssessmentQuestionsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RatAssessmentQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
