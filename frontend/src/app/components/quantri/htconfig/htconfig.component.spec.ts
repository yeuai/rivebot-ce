import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtconfigComponent } from './htconfig.component';

describe('HtconfigComponent', () => {
  let component: HtconfigComponent;
  let fixture: ComponentFixture<HtconfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtconfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
