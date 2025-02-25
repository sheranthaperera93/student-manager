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

  it('should have default age range', () => {
    expect(component.ageRange).toEqual([20, 40]);
  });

  it('should emit export event with correct parameters', () => {
    spyOn(component.export, 'emit');
    component.onExportHandler();
    expect(component.export.emit).toHaveBeenCalledWith({
      ageRange: { from: 20, to: 40 },
    });
  });

  it('should update age range and emit correct parameters', () => {
    spyOn(component.export, 'emit');
    component.ageRange = [30, 50];
    component.onExportHandler();
    expect(component.export.emit).toHaveBeenCalledWith({
      ageRange: { from: 30, to: 50 },
    });
  });
});
