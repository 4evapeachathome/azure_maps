import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HealthyunhealathyquizComponent } from './healthyunhealathyquiz.component';

describe('HealthyunhealathyquizComponent', () => {
  let component: HealthyunhealathyquizComponent;
  let fixture: ComponentFixture<HealthyunhealathyquizComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthyunhealathyquizComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthyunhealathyquizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
