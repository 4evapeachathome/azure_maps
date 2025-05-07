import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NopeaceathomePage } from './nopeaceathome.page';

describe('NopeaceathomePage', () => {
  let component: NopeaceathomePage;
  let fixture: ComponentFixture<NopeaceathomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NopeaceathomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
