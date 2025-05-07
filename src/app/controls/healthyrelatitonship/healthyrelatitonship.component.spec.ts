import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HealthyrelatitonshipComponent } from './healthyrelatitonship.component';

describe('HealthyrelatitonshipComponent', () => {
  let component: HealthyrelatitonshipComponent;
  let fixture: ComponentFixture<HealthyrelatitonshipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthyrelatitonshipComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthyrelatitonshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
