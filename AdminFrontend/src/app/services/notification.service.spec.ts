import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { of } from 'rxjs';
import { Notification } from '../model/notification.model';
import { JOB_STATUS, JOB_TYPES } from '../core/constants';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule]
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the correct count of failed jobs', () => {
    const jobQueue: Notification[] = [
      { id: 1, date: new Date(), name: 'Upload failed', type: JOB_TYPES.UPLOAD, status: JOB_STATUS.FAILED },
      { id: 2, date: new Date(), name: 'Upload success', type: JOB_TYPES.UPLOAD, status: JOB_STATUS.SUCCESS },
      { id: 3, date: new Date(), name: 'Upload pending', type: JOB_TYPES.UPLOAD, status: JOB_STATUS.PENDING },
    ];
    const failedJobCount = service.getFailedJobCount(jobQueue);
    expect(failedJobCount).toBe(1);
  });

  it('should show a notification with the correct settings', () => {
    spyOn(service['notificationService'], 'show');
    service.showNotification('success', 'Test message');
    expect(service['notificationService'].show).toHaveBeenCalledWith(
      jasmine.objectContaining({
        content: 'Test message',
        type: { style: 'success', icon: true },
        hideAfter: 2000,
        position: { horizontal: 'center', vertical: 'top' },
        animation: { type: 'fade', duration: 1000 },
        height: 50,
      })
    );
  });

  it('should retry a job queue item', (done) => {
    spyOn(service['apollo'], 'mutate').and.returnValue(of({ data: { retryJobQueueItem: 'Job retried' } }));
    service.retryJobQueueItem(1).subscribe((result) => {
      expect(result.message).toBe('Job retried');
      done();
    });
  });

  it('should download an export job', (done) => {
    spyOn(service['apollo'], 'watchQuery').and.returnValue({
      valueChanges: of({ data: { downloadExport: 'export-file.xlsx' } }),
    } as any);
    service.downloadExportJob(1).subscribe((result) => {
      expect(result.fileName).toBe('export-file.xlsx');
      done();
    });
  });
});
