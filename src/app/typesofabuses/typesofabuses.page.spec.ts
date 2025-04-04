import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypesofabusesPage } from './typesofabuses.page';

describe('TypesofabusesPage', () => {
  let component: TypesofabusesPage;
  let fixture: ComponentFixture<TypesofabusesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TypesofabusesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
