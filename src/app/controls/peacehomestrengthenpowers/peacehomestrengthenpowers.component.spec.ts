import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PeacehomestrengthenpowersComponent } from './peacehomestrengthenpowers.component';

describe('PeacehomestrengthenpowersComponent', () => {
  let component: PeacehomestrengthenpowersComponent;
  let fixture: ComponentFixture<PeacehomestrengthenpowersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeacehomestrengthenpowersComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PeacehomestrengthenpowersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
