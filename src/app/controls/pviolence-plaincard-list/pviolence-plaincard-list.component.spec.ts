import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PviolencePlaincardListComponent } from './pviolence-plaincard-list.component';

describe('PviolencePlaincardListComponent', () => {
  let component: PviolencePlaincardListComponent;
  let fixture: ComponentFixture<PviolencePlaincardListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PviolencePlaincardListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PviolencePlaincardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
