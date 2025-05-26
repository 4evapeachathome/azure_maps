import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCreationPage } from './user-creation.page';

describe('UserCreationPage', () => {
  let component: UserCreationPage;
  let fixture: ComponentFixture<UserCreationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCreationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
