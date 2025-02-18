import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NopeacehomescenariooneComponent } from './nopeacehomescenarioone.component';

describe('NopeacehomescenariooneComponent', () => {
  let component: NopeacehomescenariooneComponent;
  let fixture: ComponentFixture<NopeacehomescenariooneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NopeacehomescenariooneComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NopeacehomescenariooneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
