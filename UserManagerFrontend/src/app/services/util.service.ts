import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor() {}

  /**
   * Calculates the age based on the given date of birth.
   *
   * @param dateOfBirth - The date of birth to calculate the age from.
   * @returns The calculated age in years.
   */
  calculateAge(dateOfBirth: Date): number {
    const birthDate = dayjs(dateOfBirth);
    const currentDate = dayjs();
    const age = currentDate.diff(birthDate, 'year');
    return age;
  }

  formatDate = (date: Date, format: string) => {
    return dayjs(date).format(format);
  };
}
