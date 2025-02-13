import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DIALOG_ACTIONS } from '../../core/constants';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: false,
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {

  @Input() isVisible: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Output() onConfirm: EventEmitter<DIALOG_ACTIONS> = new EventEmitter<DIALOG_ACTIONS>();
  public DIALOG_ACTIONS = DIALOG_ACTIONS;

  /**
   * Closes the confirmation dialog and emits the specified action.
   * 
   * @param {DIALOG_ACTIONS} action - The action to emit when the dialog is closed.
   * @returns {void}
   */
  closeDialog = (action: DIALOG_ACTIONS): void => {
    this.isVisible = false;
    this.onConfirm.emit(action);
  }

}
