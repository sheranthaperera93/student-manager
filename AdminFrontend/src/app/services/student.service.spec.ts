import { TestBed } from '@angular/core/testing';

import { StudentService } from './student.service';
import { ApolloModule } from 'apollo-angular';

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloModule]
    });
    service = TestBed.inject(StudentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
