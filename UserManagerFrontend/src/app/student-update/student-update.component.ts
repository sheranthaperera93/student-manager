import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';

@Component({
  selector: 'app-student-update',
  standalone: false,
  templateUrl: './student-update.component.html',
  styleUrl: './student-update.component.scss',
})
export class StudentUpdateComponent {
  public dobMin: Date = new Date(1917, 0, 1);
  public dobMax: Date = new Date();

  public editForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateOfBirth: new FormControl(new Date(), Validators.required),
  });

  constructor(private readonly dialogRef: DialogRef) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
    this.dialogRef.close('success');
  }
}
