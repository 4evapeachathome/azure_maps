import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SsripaactionplanComponent } from './ssripaactionplan.component';

describe('SsripaactionplanComponent', () => {
  let component: SsripaactionplanComponent;
  let fixture: ComponentFixture<SsripaactionplanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SsripaactionplanComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SsripaactionplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
