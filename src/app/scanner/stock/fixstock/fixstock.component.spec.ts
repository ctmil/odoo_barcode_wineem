import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixstockComponent } from './fixstock.component';

describe('FixstockComponent', () => {
  let component: FixstockComponent;
  let fixture: ComponentFixture<FixstockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixstockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixstockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
