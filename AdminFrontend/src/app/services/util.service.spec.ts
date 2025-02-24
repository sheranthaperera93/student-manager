import { TestBed } from '@angular/core/testing';

import { UtilService } from './util.service';
import dayjs from 'dayjs';

xdescribe('UtilService', () => {
  let service: UtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateAge', () => {
    it('should calculate the correct age', () => {
      const dateOfBirth = new Date(2000, 0, 1); // January 1, 2000
      const expectedAge = dayjs().diff(dayjs(dateOfBirth), 'year');
      expect(service.calculateAge(dateOfBirth)).toBe(expectedAge);
    });
  });

  describe('formatDate', () => {
    it('should format the date correctly', () => {
      const date = new Date(2025, 1, 14); // February 14, 2025
      const format = 'YYYY-MM-DD';
      const expectedFormattedDate = dayjs(date).format(format);
      expect(service.formatDate(date, format)).toBe(expectedFormattedDate);
    });
  });
});
