import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckstockComponent } from './checkstock.component';

describe('CheckstockComponent', () => {
  let component: CheckstockComponent;
  let fixture: ComponentFixture<CheckstockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckstockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckstockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
