import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HealthyrelationshipcontentComponent } from './healthyrelationshipcontent.component';

describe('HealthyrelationshipcontentComponent', () => {
  let component: HealthyrelationshipcontentComponent;
  let fixture: ComponentFixture<HealthyrelationshipcontentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthyrelationshipcontentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthyrelationshipcontentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
