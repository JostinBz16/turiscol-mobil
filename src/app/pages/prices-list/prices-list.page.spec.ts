import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PricesListPage } from './prices-list.page';

describe('PricesListPage', () => {
  let component: PricesListPage;
  let fixture: ComponentFixture<PricesListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PricesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
