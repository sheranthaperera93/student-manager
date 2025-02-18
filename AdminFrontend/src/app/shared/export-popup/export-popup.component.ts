import { Component, EventEmitter, Output } from '@angular/core';
import { ExportParameters } from '../../core/constants';

@Component({
  selector: 'app-export-popup',
  standalone: false,
  templateUrl: './export-popup.component.html',
  styleUrls: ['./export-popup.component.scss'],
})
export class ExportPopupComponent {
  maxAge: number = 70;
  minAge: number = 5;
  ageRange: [number, number] = [20, 40];
  @Output() export: EventEmitter<ExportParameters> =
    new EventEmitter<ExportParameters>();

  /**
   * Handles the export action by emitting an event with the current age range.
   * The event is emitted through the `export` EventEmitter.
   *
   * @returns {void}
   */
  onExportHandler = () => {
    this.export.emit({
      ageRange: { from: this.ageRange[0], to: this.ageRange[1] },
    });
  };
}
