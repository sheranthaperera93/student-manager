import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportPopupComponent } from './export-popup.component';
import { LabelModule } from '@progress/kendo-angular-label';
import { RangeSliderModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';

describe('ExportPopupComponent', () => {
  let component: ExportPopupComponent;
  let fixture: ComponentFixture<ExportPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelModule, RangeSliderModule, FormsModule],
      declarations: [ExportPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
