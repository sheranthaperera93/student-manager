import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsComponent } from './notifications.component';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';
import { JOB_STATUS, JOB_TYPES } from '../../core/constants';
import { Notification } from '../../model/notification.model';
import { ApolloTestingModule } from 'apollo-angular/testing';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    notificationService = jasmine.createSpyObj('NotificationService', [
      'retryJobQueueItem',
      'showNotification',
      'downloadExportJob',
      'getFailedJobCount',
    ]);
    await TestBed.configureTestingModule({
      imports: [ListViewModule, ApolloTestingModule],
      declarations: [NotificationsComponent],
      providers: [
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle retry job action', () => {
    const notification: Notification = {
      id: 1,
      name: 'Upload Failed',
      date: new Date(),
      status: JOB_STATUS.FAILED,
      type: JOB_TYPES.UPLOAD,
    };
    notificationService.retryJobQueueItem.and.returnValue(
      of({ message: '', data: {} })
    );
    component.onActionHandler(notification);
    expect(notificationService.retryJobQueueItem).toHaveBeenCalledWith(1);
    expect(notificationService.showNotification).toHaveBeenCalledWith(
      'success',
      'Re-try job initiated successfully'
    );
  });

  it('should handle download export job action', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const mockFetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(blob));
    (window as any).fetch = mockFetch;
    const notification: Notification = {
      id: 2,
      name: 'Export Success',
      date: new Date(),
      status: JOB_STATUS.SUCCESS,
      type: JOB_TYPES.EXPORT,
    };
    const response = { fileName: 'testfile.txt' };
    
    notificationService.downloadExportJob.and.returnValue(of(response));
    component.onActionHandler(notification);
    expect(notificationService.downloadExportJob).toHaveBeenCalledWith(2);
    expect(mockFetch).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/download\/testfile.txt$/)
    );
  });

  it('should get failed job count', () => {
    const notifications: Notification[] = [
      {
        id: 1,
        name: 'ob Failed',
        date: new Date(),
        status: JOB_STATUS.FAILED,
        type: JOB_TYPES.UPLOAD,
      },
      {
        id: 2,
        name: 'Job success',
        date: new Date(),
        status: JOB_STATUS.SUCCESS,
        type: JOB_TYPES.EXPORT,
      },
    ];
    component.items = notifications;
    notificationService.getFailedJobCount.and.returnValue(1);
    const count = component.getFailedJobCount();
    expect(count).toBe(1);
    expect(notificationService.getFailedJobCount).toHaveBeenCalledWith(
      notifications
    );
  });
});
