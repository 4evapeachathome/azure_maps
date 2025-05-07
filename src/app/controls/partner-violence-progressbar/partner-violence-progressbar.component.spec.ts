import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PartnerViolenceProgressbarComponent } from './partner-violence-progressbar.component';

describe('PartnerViolenceProgressbarComponent', () => {
  let component: PartnerViolenceProgressbarComponent;
  let fixture: ComponentFixture<PartnerViolenceProgressbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerViolenceProgressbarComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PartnerViolenceProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
