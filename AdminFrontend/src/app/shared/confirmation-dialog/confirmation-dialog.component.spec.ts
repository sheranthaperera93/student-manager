import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the correct action and close the dialog when closeDialog is called', () => {
    spyOn(component.onConfirm, 'emit');
    component.isVisible = true;

    component.closeDialog(component.DIALOG_ACTIONS.YES);

    expect(component.isVisible).toBeFalse();
    expect(component.onConfirm.emit).toHaveBeenCalledWith(component.DIALOG_ACTIONS.YES);
  });

  it('should set isVisible to false when closeDialog is called', () => {
    component.isVisible = true;

    component.closeDialog(component.DIALOG_ACTIONS.CANCEL);

    expect(component.isVisible).toBeFalse();
  });
});
