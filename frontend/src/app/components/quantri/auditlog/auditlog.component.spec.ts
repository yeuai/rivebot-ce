import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditlogComponent } from './auditlog.component';

describe('AuditlogComponent', () => {
  let component: AuditlogComponent;
  let fixture: ComponentFixture<AuditlogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditlogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
