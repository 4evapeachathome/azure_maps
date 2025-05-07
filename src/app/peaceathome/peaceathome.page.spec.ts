import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeaceathomePage } from './peaceathome.page';

describe('PeaceathomePage', () => {
  let component: PeaceathomePage;
  let fixture: ComponentFixture<PeaceathomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PeaceathomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
