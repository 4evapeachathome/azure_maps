import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerviolencePage } from './partnerviolence.page';

describe('PartnerviolencePage', () => {
  let component: PartnerviolencePage;
  let fixture: ComponentFixture<PartnerviolencePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerviolencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
