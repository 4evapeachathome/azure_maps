import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CriminilizationofsurvivorsComponent } from './criminilizationofsurvivors.component';

describe('CriminilizationofsurvivorsComponent', () => {
  let component: CriminilizationofsurvivorsComponent;
  let fixture: ComponentFixture<CriminilizationofsurvivorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CriminilizationofsurvivorsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CriminilizationofsurvivorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
