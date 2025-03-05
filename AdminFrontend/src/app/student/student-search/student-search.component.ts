import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  filterClearIcon,
  searchIcon,
  SVGIcon,
} from '@progress/kendo-svg-icons';
import { StudentService } from '../../services/student.service';
import { StudentSearch } from '../../model/student-search.model';
import dayjs from 'dayjs';

@Component({
  selector: 'app-student-search',
  standalone: false,
  templateUrl: './student-search.component.html',
  styleUrl: './student-search.component.scss',
})
export class StudentSearchComponent {
  public searchIcon: SVGIcon = searchIcon;
  public resetIcon: SVGIcon = filterClearIcon;
  public studentSearchFrm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    dateOfBirthStart: new FormControl(dayjs().subtract(50, 'year').toDate()),
    dateOfBirthEnd: new FormControl(new Date()),
  });

  constructor(private readonly studentService: StudentService) {}

  handleOnSearch = () => {
    const payload: StudentSearch = new StudentSearch();
    payload.name = this.studentSearchFrm.value.name;
    payload.email = this.studentSearchFrm.value.email;
    payload.dob = {
      from: this.studentSearchFrm.value.dateOfBirthStart.toISOString(),
      to: this.studentSearchFrm.value.dateOfBirthEnd.toISOString(),
    };
    this.studentService.refreshStudentList.next(payload);
  };

  handleOnClear = () => {
    this.studentSearchFrm.patchValue({
      name: '',
      email: '',
      dateOfBirthStart: dayjs().subtract(50, 'year').toDate(),
      dateOfBirthEnd: new Date(),
    });
    this.handleOnSearch();
  };
}
