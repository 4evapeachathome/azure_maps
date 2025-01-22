import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PeaceathomecardwithimageComponent } from './peaceathomecardwithimage.component';

describe('PeaceathomecardwithimageComponent', () => {
  let component: PeaceathomecardwithimageComponent;
  let fixture: ComponentFixture<PeaceathomecardwithimageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeaceathomecardwithimageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PeaceathomecardwithimageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
