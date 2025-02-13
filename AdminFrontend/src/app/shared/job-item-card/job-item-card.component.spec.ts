import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobItemCardComponent } from './job-item-card.component';

describe('ExportItemCardComponent', () => {
  let component: JobItemCardComponent;
  let fixture: ComponentFixture<JobItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobItemCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
