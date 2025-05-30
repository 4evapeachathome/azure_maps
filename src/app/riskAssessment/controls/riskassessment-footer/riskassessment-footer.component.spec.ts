import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RiskassessmentFooterComponent } from './riskassessment-footer.component';

describe('RiskassessmentFooterComponent', () => {
  let component: RiskassessmentFooterComponent;
  let fixture: ComponentFixture<RiskassessmentFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskassessmentFooterComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RiskassessmentFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
