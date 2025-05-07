import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UnhealthyrelationexampleComponent } from './unhealthyrelationexample.component';

describe('UnhealthyrelationexampleComponent', () => {
  let component: UnhealthyrelationexampleComponent;
  let fixture: ComponentFixture<UnhealthyrelationexampleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnhealthyrelationexampleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnhealthyrelationexampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
