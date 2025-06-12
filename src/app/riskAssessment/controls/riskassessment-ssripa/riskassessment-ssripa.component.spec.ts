import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RiskassessmentSSripaComponent } from './riskassessment-ssripa.component';

describe('RiskassessmentSSripaComponent', () => {
  let component: RiskassessmentSSripaComponent;
  let fixture: ComponentFixture<RiskassessmentSSripaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskassessmentSSripaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RiskassessmentSSripaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
