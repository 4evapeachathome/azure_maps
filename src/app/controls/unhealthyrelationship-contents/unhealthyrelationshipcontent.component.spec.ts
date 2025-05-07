import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UnhealthyRelationshipContent } from './unhealthyrelationshipcontent';

describe('NopeacehomescenariooneComponent', () => {
  let component: UnhealthyRelationshipContent;
  let fixture: ComponentFixture<UnhealthyRelationshipContent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnhealthyRelationshipContent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnhealthyRelationshipContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
