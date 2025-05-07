import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SripaaPage } from './sripaa.page';

describe('SripaaPage', () => {
  let component: SripaaPage;
  let fixture: ComponentFixture<SripaaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SripaaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
