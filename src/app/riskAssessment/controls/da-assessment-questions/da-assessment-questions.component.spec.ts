import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DaAssessmentQuestionsComponent } from './da-assessment-questions.component';

describe('DaAssessmentQuestionsComponent', () => {
  let component: DaAssessmentQuestionsComponent;
  let fixture: ComponentFixture<DaAssessmentQuestionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DaAssessmentQuestionsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DaAssessmentQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
