import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { of, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { StudentService } from '../services/student.service';
import { FileInfo, UploadsModule } from '@progress/kendo-angular-upload';
import { LabelModule } from '@progress/kendo-angular-label';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { AvatarModule, LayoutModule } from '@progress/kendo-angular-layout';
import { NavigationModule } from '@progress/kendo-angular-navigation';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { IconsModule } from '@progress/kendo-angular-icons';

xdescribe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let notificationService: NotificationService;
  let studentService: StudentService;

  beforeEach(async () => {
    notificationService = jasmine.createSpyObj('NotificationService', [
      'getFailedJobCount',
    ]);
    studentService = jasmine.createSpyObj('StudentService', ['uploadFile']);

    await TestBed.configureTestingModule({
      imports: [
        LabelModule,
        DialogsModule,
        AvatarModule,
        LayoutModule,
        NavigationModule,
        IndicatorsModule,
        IconsModule,
        UploadsModule
      ],
      declarations: [HeaderComponent],
      providers: [
        { provide: NotificationService, useValue: notificationService },
        { provide: StudentService, useValue: studentService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open upload dialog', () => {
    component.openUploadDialog();
    expect(component.isUploadDialogVisible).toBeTrue();
  });

  it('should close upload dialog', () => {
    component.closeUploadDialog();
    expect(component.isUploadDialogVisible).toBeFalse();
  });

  it('should upload file successfully', () => {
    const fileInfo: FileInfo = {
      name: 'test.txt',
      rawFile: new File([], 'test.txt'),
    };
    (studentService.uploadFile as jasmine.Spy).and.returnValue(
      of('File uploaded successfully')
    );

    component.uploadFile(fileInfo);

    expect(studentService.uploadFile).toHaveBeenCalledWith(fileInfo.rawFile!);
    expect(component.isUploadDialogVisible).toBeFalse();
  });

  it('should handle file upload error', () => {
    const fileInfo: FileInfo = {
      name: 'test.txt',
      rawFile: new File([], 'test.txt'),
    };
    (studentService.uploadFile as jasmine.Spy).and.returnValue(
      throwError(() => new Error('File upload failed'))
    );

    component.uploadFile(fileInfo);

    expect(studentService.uploadFile).toHaveBeenCalledWith(fileInfo.rawFile!);
    expect(component.isUploadDialogVisible).toBeFalse();
  });

  it('should get failed job count', () => {
    (notificationService.getFailedJobCount as jasmine.Spy).and.returnValue(1);

    const failedJobCount = component.getFailedJobCount();

    expect(notificationService.getFailedJobCount).toHaveBeenCalledWith(
      component.jobQueue
    );
    expect(failedJobCount).toBe(1);
  });
});
