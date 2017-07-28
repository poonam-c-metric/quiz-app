import { TestBed, inject } from '@angular/core/testing';

import { StudentModuleService } from './student-module.service';

describe('StudentModuleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StudentModuleService]
    });
  });

  it('should be created', inject([StudentModuleService], (service: StudentModuleService) => {
    expect(service).toBeTruthy();
  }));
});
