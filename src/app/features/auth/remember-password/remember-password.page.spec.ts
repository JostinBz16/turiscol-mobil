import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RememberPasswordPage } from './remember-password.page';

describe('RememberPasswordPage', () => {
  let component: RememberPasswordPage;
  let fixture: ComponentFixture<RememberPasswordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RememberPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
