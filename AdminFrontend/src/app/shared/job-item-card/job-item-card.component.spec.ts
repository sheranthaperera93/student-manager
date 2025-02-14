import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobItemCardComponent } from './job-item-card.component';
import { AvatarModule } from '@progress/kendo-angular-layout';
import { JOB_STATUS, JOB_TYPES } from '../../core/constants';
import { SVGIconModule } from '@progress/kendo-angular-icons';
import { ButtonModule } from '@progress/kendo-angular-buttons';

describe('JobItemCardComponent', () => {
  let component: JobItemCardComponent;
  let fixture: ComponentFixture<JobItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarModule, SVGIconModule, ButtonModule],
      declarations: [JobItemCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JobItemCardComponent);
    component = fixture.componentInstance;

    component.item = {
      date: new Date(),
      id: 0,
      name: '',
      status: JOB_STATUS.SUCCESS,
      type: JOB_TYPES.EXPORT,
    };
    component.borderTop = true;

    fixture.detectChanges();
  });

  beforeEach(async () => {
    component.borderTop = true;
    component.item = {
      date: new Date(),
      id: 1,
      name: '',
      status: JOB_STATUS.SUCCESS,
      type: JOB_TYPES.EXPORT,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
