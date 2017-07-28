import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentpasswordComponent } from './studentpassword.component';

describe('StudentpasswordComponent', () => {
  let component: StudentpasswordComponent;
  let fixture: ComponentFixture<StudentpasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentpasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
